import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Message } from 'entity/message.entity';
import { User } from 'entity/user.entity';
import { getRepository, Repository } from 'typeorm';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,

        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    
      ) {}

    async getInterlocutor(username): Promise<User> {
        const interlocutor = await this.userRepository.findOne({
            where: { username: username },
        });

        return interlocutor;
    }

    async getMessages(user, interlocutor): Promise<object[]> {
        const userChats = [];
        const userEntityChats = await this.chatRepository.find({
        where: { member: user },
        });

        if (userEntityChats.length == 0) return [];

        for (let i = 0; i < userEntityChats.length; i++)
            userChats.push(userEntityChats[i].id_chat);

        const membersTheChat = await getRepository(Chat)
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.member', 'member')
            .where('chat.id_chat IN (:...id)', { id: userChats })
            .getMany();
        
        let id_chat;
        for (let i = 0; i < membersTheChat.length; i++)
            if (membersTheChat[i].member.id == interlocutor.id) {
                id_chat =  membersTheChat[i].id_chat;
                break;
            } else if (i == membersTheChat.length - 1) return []

        const messages = await getRepository(Message)
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.chat = :id', { id: id_chat })
            .getMany();

        messages.forEach((el) => {
            if (el.sender.id == user.id) el['im-sender'] = true;  
            el.sent_date = new Date(+el.sent_date).toLocaleTimeString().slice(0,-3);        
        })

        return messages
    }

    async getMessagesById(id_chat, id_user): Promise<Message[]> {
        const messages = await getRepository(Message)
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.chat = :id', { id: id_chat })
            .getMany();
    
        messages.forEach((element) => {
          if (element.sender.id != id_user) delete element.sender;
        });
    
        return messages;
      }

    async getChats(user): Promise<object[]> {
        const id_chats = [];
        const chats = await getRepository(Chat)
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.member', 'member')
            .where('chat.member = :id', { id: user.id })
            .getMany(); 

        for (let i = 0; i < chats.length; i++) id_chats.push(chats[i].id_chat);
        if (chats.length == 0) return [];

        const chatsInfo = await getRepository(ChatInfo)
            .createQueryBuilder('chatInfo')
            .leftJoinAndSelect('chatInfo.last_message_sender', 'sender')
            .where('chatInfo.chat IN (:...id)', { id: id_chats })
            .getMany();
            
        for (let i = 0; i < chats.length; i++) {
            chatsInfo[i]['last_message_time'] = new Date(+chatsInfo[i]['last_message_time']).toLocaleTimeString().slice(0,-3);
            chats[i]['info'] = chatsInfo[i];
            if (chatsInfo[i].last_message_sender.id == user.id) chats[i]['sender'] = true;
            else chats[i]['sender'] = false;
            
            const chatInterlocutor = await getRepository(Chat)
                .createQueryBuilder('chat')
                .leftJoinAndSelect('chat.member', 'member')
                .where('chat.id_chat = :id and chat.member <> :id_user', { id: chats[i].id_chat, id_user: user.id })
                .getOne();
            
            chats[i]['interlocutor'] = chatInterlocutor.member;      
        }           
         
        return chats;
    }
}
