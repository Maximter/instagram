import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'entity/follower.entity';
import { LikePost } from 'entity/like.entity';
import { User_post } from 'entity/user_post.entity';
import { getConnection, Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(LikePost)
    private like_postRepository: Repository<LikePost>,

    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,

    @InjectRepository(User_post)
    private user_postRepository: Repository<User_post>,
  ) {}

  async getNotifications(user): Promise<object[]> {
    const postsInfo = await getConnection()
      .getRepository(User_post)
      .createQueryBuilder('user_post')
      .leftJoinAndSelect('user_post.user', 'user')
      .where('user_post.user = :id', { id: user.id })
      .getMany();

    if (postsInfo.length == 0) return;
    const id_img = [];
    for (let i = 0; i < postsInfo.length; i++) {
      id_img.push(postsInfo[i].id_img);
    }

    let likes = await getConnection()
      .getRepository(LikePost)
      .createQueryBuilder('like_post')
      .leftJoinAndSelect('like_post.post', 'post')
      .leftJoinAndSelect('like_post.user', 'user')
      .where('like_post.post IN (:...id) and like_post.user != :id_user', { id: id_img, id_user: user.id })
      .orderBy('like_post.id', 'DESC')
      .take(14)
      .getMany();

    likes.forEach((element) => {
      if (fs.existsSync(`./public/img/post/postedGif/${element.post.id_img}.gif`)) element['gif'] = true;
      else if (fs.existsSync(`./public/img/post/postedVid/${element.post.id_img}.mp4`)) element['mp4'] = true;
    })

    let follow = await getConnection()
      .getRepository(Follow)
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'follower')
      .leftJoinAndSelect('follow.following', 'following')
      .where('follow.following = :id', { id: user.id })
      .orderBy('follow.id', 'DESC')
      .take(1)
      .getMany();

    return [...follow, ...likes];
  }
}
