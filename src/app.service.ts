import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { getConnection, getRepository, Repository } from 'typeorm';
import * as fs from 'fs';
import { User } from 'entity/user.entity';
import { Follow } from 'entity/follower.entity';
import { User_post } from 'entity/user_post.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async getUser(req): Promise<User> {
    const token = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: req.cookies['instyle_token'] })
      .getOne();

    if (token) return token.user;
    else return undefined;
  }

  async getPosts(user) {
    const id: number[] = [];

    const followings = await getConnection()
      .getRepository(Follow)
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'following')
      .leftJoinAndSelect('follow.follower', 'follower')
      .where('follow.follower = :follower', { follower: user.id })
      .getMany();

    followings.forEach((element) => {
      id.push(element.following.id);
    });

    let followingPosts = [];
    if (id.length != 0) {
      followingPosts = await getConnection()
        .getRepository(User_post)
        .createQueryBuilder('user_post')
        .leftJoinAndSelect('user_post.user', 'user')
        .where('user_post.user IN (:...id)', { id: id })
        .orderBy('user_post.date_post')
        .getMany();
      followingPosts.reverse();
      followingPosts.length = 10;
    }

    return followingPosts;
  }
}
