import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'entity/follower.entity';
import { User } from 'entity/user.entity';
import { User_post } from 'entity/user_post.entity';
import { getConnection, Repository } from 'typeorm';
import * as fs from 'fs';


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

  async getPosts(user: User): Promise<User_post[]> {
    const posts = await getConnection()
      .getRepository(User_post)
      .createQueryBuilder('user_post')
      .leftJoinAndSelect('user_post.user', 'user')
      .where('user_post.user = :user', { user: user.id })
      .orderBy('date_post')
      .getMany();

    posts.forEach((element) => {
      if (fs.existsSync(`./public/img/post/postedGif/${element.id_img}.gif`)) element['gif'] = true;
      else if (fs.existsSync(`./public/img/post/postedVid/${element.id_img}.mp4`)) element['mp4'] = true;
    })

    posts.reverse();
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
    const follower = await getConnection()
      .getRepository(Follow)
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'follower')
      .where('follow.following = :user', { user: user.id })
      .getMany();

    const following = await getConnection()
      .getRepository(Follow)
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'following')
      .where('follow.follower = :user', { user: user.id })
      .getMany();

    return { follower: follower, following: following };
  }
}
