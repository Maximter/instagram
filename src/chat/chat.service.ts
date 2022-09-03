import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'entity/chat.entity';
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
}
