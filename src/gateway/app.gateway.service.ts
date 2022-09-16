import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, getManager, getRepository, Repository } from 'typeorm';
import * as online from '../online';
import * as uuid from 'uuid';
import { UrlWithStringQuery } from 'url';
import { Message } from 'entity/message.entity';
// import { Message } from 'entity/message.entity';
const fs = require('fs');

export class SocketService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatInfo)
    private chatInfoRepository: Repository<ChatInfo>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessageToDB(client, payload): Promise<void> {
    const message = payload[0];
    const id_chat = payload[1];
    const date = `${Date.now()}`;

    const token = await SocketService.getToken(client);
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const user = tokenEntity.user;

    const ai_chat = await this.chatInfoRepository.findOne({
      where: { chat: id_chat },
    });

    ai_chat.last_message_content = `${message.slice(0, 30)}...`;
    ai_chat.last_message_sender = user;
    ai_chat.last_message_time = date;
    this.chatInfoRepository.save(ai_chat);

    const savedMessage: Message = this.messageRepository.create({
      chat: id_chat,
      content: message,
      sender: user,
      sent_date: `${Date.now()}`,
    });
    await this.messageRepository.save(savedMessage);
  }

  async getInterlocutorsToken(client, id_chat): Promise<string[]> {
    const my_token = await SocketService.getToken(client);
    const my_tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: my_token })
      .getOne();

    const user = my_tokenEntity.user;

    const members = await getConnection()
      .getRepository(Chat)
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.member', 'member')
      .where('chat.id_chat = :id', { id: id_chat })
      .getMany();

    let interlocutor;

    for (let i = 0; i < members.length; i++) {
      if (members[i].member.id != user.id) {
        interlocutor = members[i].member;
        break;
      }
    }
    const interlocutor_token = await this.tokenRepository.findOne({
      where: { user: interlocutor },
    });
    
    if (interlocutor_token == undefined) return undefined;
    return online[`${interlocutor_token.token}`];
  }

  async getInterlocutorsInfo(id, message): Promise<object> {
    const interlocutor = await this.userRepository.findOne({
      where: { id: id },
    });

    interlocutor['sender'] = true;
    interlocutor['message'] = message;

    return interlocutor;
  }

  async createChat(client, payload) {
    const message = payload[0].trim();
    const idInterlocutor = payload[1];

    const token = await SocketService.getToken(client);
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const user = tokenEntity.user;
    const interlocutor = await this.userRepository.findOne({
      where: { id: idInterlocutor },
    });

    const existed_chat = await this.checkExistchat(user, interlocutor);
    if (existed_chat != '') return { id_chat: existed_chat, exist: true };

    const chat_id: string = await uuid.v4();

    await getManager().transaction(async (transactionalEntityManager) => {
      const newChat1: Chat = await this.chatRepository.create({
        id_chat: chat_id,
        member: user,
      });

      const newChat2: Chat = await this.chatRepository.create({
        id_chat: chat_id,
        unread: 1,
        member: interlocutor,
      });
      
      const newChatInfo: ChatInfo = this.chatInfoRepository.create({
        chat: chat_id,
        last_message_content: message,
        last_message_time: `${Date.now()}`,
        last_message_sender: user,
      });

      await transactionalEntityManager.save(newChat1);     
      await transactionalEntityManager.save(newChat2);
      await transactionalEntityManager.save(newChatInfo);
    });

    const savedMessage: Message = this.messageRepository.create({
      chat: chat_id,
      content: message,
      sender: user,
      sent_date: `${Date.now()}`,
    });
    await this.messageRepository.save(savedMessage);
    return { id_chat: chat_id, exist: false };
  }

  async getUserTokens(client): Promise<string[]> {
    const my_token = await SocketService.getToken(client);

    if (online[`${my_token}`] != undefined) return online[`${my_token}`];
    else return [];
  }

  async checkExistchat(user, interlocutor): Promise<string> {
    const userChats = [];
    const userEntityChats = await this.chatRepository.find({
      where: { member: user },
    });

    if (userEntityChats.length == 0) return '';

    for (let i = 0; i < userEntityChats.length; i++)
      userChats.push(userEntityChats[i].id_chat);

    const membersTheChat = await getRepository(Chat)
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.member', 'member')
      .where('chat.id_chat IN (:...id)', { id: userChats })
      .getMany();
    
    for (let i = 0; i < membersTheChat.length; i++)
      if (membersTheChat[i].member.id == interlocutor.id)
        return membersTheChat[i].id_chat;

    return '';
  }

  async pushToOnline(client): Promise<void> {
    const token = await SocketService.getToken(client); 

    if (online[`${token}`] == undefined) online[`${token}`] = [client.id];
    else online[`${token}`].push(client.id);

    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();      

    const id_user = tokenEntity.user.id;
    this.userRepository.save({
      id: id_user,
      online: `0`,
    });
  }

  async deleteFromOnline(client): Promise<void> {
    const token = await SocketService.getToken(client);

    online[`${token}`].splice(online[`${token}`].indexOf(client.id), 1);
    if (online[`${token}`].length == 0) delete online[`${token}`];

    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const id_user = tokenEntity.user.id;
    this.userRepository.save({
      id: id_user,
      online: `${Date.now()}`,
    });
  }

  // async getAllUserInterlocutors(client): Promise<object[]> {
  //   const my_token = await SocketService.getToken(client);
  //   const my_tokenEntity = await getConnection()
  //     .getRepository(Token)
  //     .createQueryBuilder('token')
  //     .leftJoinAndSelect('token.user', 'user')
  //     .where('token.token = :token', { token: my_token })
  //     .getOne();

  //   const user = my_tokenEntity.user;
  //   const userchats = await getConnection()
  //     .getRepository(Chat)
  //     .createQueryBuilder('chat')
  //     .leftJoinAndSelect('chat.member', 'member')
  //     .where('chat.member = :member', { member: user.id_user })
  //     .getMany();

  //   let info = [];

  //   for (let i = 0; i < userchats.length; i++) {
  //     const chats = await getConnection()
  //       .getRepository(Chat)
  //       .createQueryBuilder('chat')
  //       .leftJoinAndSelect('chat.member', 'member')
  //       .where('chat.chat_id = :id', { id: userchats[i].chat_id })
  //       .getMany();

  //     chats.forEach((element) => {
  //       if (element.member.id_user != user.id_user)
  //         info.push({
  //           id_user: element.member.id_user,
  //           id_chat: element.chat_id,
  //         });
  //     });
  //   }

  //   for (let i = 0; i < info.length; i++) {
  //     const interlocutor_token = await this.tokenRepository.findOne({
  //       where: { user: info[i].id_user },
  //     });
  //     info[i]['token'] = interlocutor_token.token;
  //   }

  //   return info;
  // }

  async getUserInfo(client, payload) {
    const token = await SocketService.getToken(client);
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const user = tokenEntity.user;
    user['message'] = payload[0];
    user['sender'] = false;
    
    return user;
  }

  static getToken(client): string {
    let cookies = client.handshake.headers.cookie;
    let token = '';
    for (
      let i = cookies.indexOf('instyle_token') + 14;
      cookies[i] !== ';' && i < cookies.length;
      i++
    ) {
      token += cookies[i];
    }

    return token;
  }
}
