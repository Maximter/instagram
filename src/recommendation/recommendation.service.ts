import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikePost } from 'entity/like.entity';
import { User } from 'entity/user.entity';
import { User_post } from 'entity/user_post.entity';
import { getConnection, Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(LikePost)
    private like_postRepository: Repository<LikePost>,

    @InjectRepository(User_post)
    private user_postRepository: Repository<User_post>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getPopularPosts(): Promise<object[]> {
    const monthAgo = Date.now() - 2592000000;
    const allLikes = await getConnection()
      .getRepository(LikePost)
      .createQueryBuilder('likePost')
      .leftJoinAndSelect('likePost.post', 'post')
      .where('post.date_post > :date', { date: monthAgo })
      .getMany();

    let countLikes = [[allLikes[0].post.id_img, 1]];

    for (let i = 1; i < allLikes.length; i++) {
      for (let j = 0; j < countLikes.length; j++) {
        if (countLikes[j][0] == allLikes[i].post.id_img) {
          countLikes[j][1]++;
          break;
        }
        if (countLikes.length - 1 == j) {
          let existGif ,existVid;
          if (fs.existsSync(`./public/img/post/postedGif/${allLikes[i].post.id_img}.gif`)) existGif = true;
          else if (fs.existsSync(`./public/img/post/postedVid/${allLikes[i].post.id_img}.mp4`)) existVid = true;
          countLikes.push([allLikes[i].post.id_img, 1, existGif, existVid]);
          break;
        }
      }
    }
    countLikes.sort(this.compareSecondColumn);
    countLikes.reverse();
    countLikes.length = 30;

    return countLikes;
  }

  async findUser(username) {
    const userInfo = await this.userRepository.findOne({
      where: { username: username },
    });

    if (userInfo) {
      const { password, email, bio, verificated, ...user } = userInfo;
      return user;
    } else return undefined;
  }

  compareSecondColumn(a, b) {
    if (a[1] === b[1]) return 0;
    else return a[1] < b[1] ? -1 : 1;
  }

  async getPopularPostsFullData(countLikes): Promise<object[]> {
    const id_img = [];
    for (let i = 0; i < countLikes.length; i++) id_img.push(countLikes[i][0])
    
    const popularPosts = await getConnection()
        .getRepository(User_post)
        .createQueryBuilder('user_post')
        .leftJoinAndSelect('user_post.user', 'user')
        .where('user_post.id_img IN (:...id)', { id: id_img })
        .getMany();
      
    const rightOrder = [];
    for (let i = 0; i < id_img.length; i++) 
      for (let j = 0; i < popularPosts.length; j++) 
        if (popularPosts[j].id_img == id_img[i]) {
          rightOrder.push(popularPosts[j])
          break;
        }

    return rightOrder;
  }
}
