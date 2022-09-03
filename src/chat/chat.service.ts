import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    
      ) {}

    async getInterlocutor(username): Promise<User> {
        const interlocutor = await this.userRepository.findOne({
            where: { username: username },
        });

        return interlocutor;
    }
}
