import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { getConnection, getRepository, Repository } from 'typeorm';
import * as fs from 'fs';
import { User } from 'entity/user.entity';
import { Follow } from 'entity/follower.entity';
import { User_post } from 'entity/user_post.entity';
import { LikePost } from 'entity/like.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,

    @InjectRepository(LikePost)
    private like_postRepository: Repository<LikePost>,
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
    const id: number[] = [user.id];

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
        .orderBy('user_post.date_post', 'DESC')
        .take(10)
        .getMany();
    }

    return followingPosts;
  }

  async getLikes(user, posts) {
    if (posts.length == 0) return;
    const id = [];
    let userLikes;
    let postLikes;    

    posts.forEach((element) => {
      if (fs.existsSync(`./public/img/post/postedGif/${element.id_img}.gif`)) element['gif'] = true;
      id.push(element.id_img);
    });

    if (user) {
      userLikes = await getConnection()
        .getRepository(LikePost)
        .createQueryBuilder('likePost')
        .leftJoinAndSelect('likePost.user', 'user')
        .leftJoinAndSelect('likePost.post', 'post')
        .where('likePost.user = :user', { user: user })
        .where('likePost.post IN (:...id)', { id: id })
        .getMany();

      userLikes.forEach((el_like) => {
        for (let i = 0; i < posts.length; i++) {
          if (
            el_like.user.id == user.id &&
            posts[i].id_img == el_like.post.id_img
          ) {
            posts[i]['like'] = true;
            break;
          }
        }
      });
    }

    for (let i = 0; i < posts.length; i++) {
      postLikes = await getConnection()
        .getRepository(LikePost)
        .createQueryBuilder('likePost')
        .leftJoinAndSelect('likePost.post', 'post')
        .where('likePost.post = :id', { id: posts[i].id_img })
        .getMany();

      posts[i]['countLikes'] = postLikes.length;
    }
    return posts;
  }
}
