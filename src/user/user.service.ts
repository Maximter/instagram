import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'entity/follower.entity';
import { User } from 'entity/user.entity';
import { User_post } from 'entity/user_post.entity';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User_post)
        private user_postRepository: Repository<User_post>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Follow)
        private followRepository: Repository<Follow>,
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

    
  async getOwner(username): Promise<User> {
    const owner = await this.userRepository.findOne({
      where: { username: username },
    });

    return owner;
  }

  async isFollow(user, owner): Promise<boolean> {
    const exist = await this.followRepository.findOne({
        where: { follower: user, following: owner },
    });

    if (exist != undefined) return true;
    else return false;
  }

  async getfollows(user): Promise<object> {
    const follower = await this.followRepository.find({
      where: { following: user},
    });

    const following = await this.followRepository.find({
      where: { follower: user},
    });
    
    return { follower: follower.length, following: following.length }
  }
}
