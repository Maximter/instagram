import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { User_post } from 'entity/user_post.entity';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User_post)
        private user_postRepository: Repository<User_post>,
      ) {}


    async getPosts(user : User): Promise<User_post[]> {      
        const posts = await getConnection()
            .getRepository(User_post)
            .createQueryBuilder('user_post')
            .leftJoinAndSelect('user_post.user', 'user')
            .where('user_post.user = :user', { user: user.id })
            .orderBy('date_post')
            .getMany();

        posts.reverse()
        return posts;
    }
}
