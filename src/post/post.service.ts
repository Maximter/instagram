import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikePost } from 'entity/like.entity';
import { User_post } from 'entity/user_post.entity';
import e from 'express';
import * as fs from 'fs';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User_post)
    private user_postRepository: Repository<User_post>,

    @InjectRepository(LikePost)
    private like_postRepository: Repository<LikePost>,
  ) {}

  async checkValidData(photo, comment): Promise<object> {
    if (photo == undefined)
      return { valid: false, err: 'Фотография не была загружена' };
    if (photo.size > 62914560)
      return { valid: false, err: 'Слишком большой размер файла' };
    if (comment.length > 1500)
      return { valid: false, err: 'Слишком длинное описание фотографии' };
    return { valid: true, err: '' };
  }

  async savePicture(photo, comment, user): Promise<void> {
    if (comment != undefined) comment = comment.trim();
    else comment = '';
    const id = Math.floor(Math.random() * (99999999 - 1)) + 1;

    fs.rename(
      `./public/img/rowImg/${photo.filename}`,
      `./public/img/postedPic/${id}.jpg`,
      function (err) {
        if (err) console.log('ERROR: ' + err);
      },
    );

    const post: User_post = this.user_postRepository.create({
      id_img: id,
      user: user,
      date_post: `${Date.now()}`,
      comment: comment,
    });
    await this.user_postRepository.save(post);
  }

  async getPostInfo(id) {
    const post = await getConnection()
      .getRepository(User_post)
      .createQueryBuilder('user_post')
      .leftJoinAndSelect('user_post.user', 'user')
      .where('user_post.id_img = :id', { id: id })
      .getOne();

    return post;
  }

  async like(user, id_post) {
    const exist = await this.like_postRepository.findOne({
      where: { user: user.id, post: id_post },
    });

    if (exist != undefined) this.like_postRepository.remove(exist);
    else {
      const post = await this.user_postRepository.findOne({
        where: { id_img: id_post },
      });

      const likeSystem: LikePost = this.like_postRepository.create({
        user: user,
        post: post,
      });
      this.like_postRepository.save(likeSystem);
    }
  }

  async isOwner(user, post_id): Promise<boolean> {
    const post = await getConnection()
      .getRepository(User_post)
      .createQueryBuilder('user_post')
      .leftJoinAndSelect('user_post.user', 'user')
      .where('user_post.id_img = :id', { id: post_id })
      .getOne();

    if (post.user.id == user.id) return true;
    else return false;
  }

  async deletePost(user, post_id): Promise<void> {
    const post = await getConnection()
      .getRepository(User_post)
      .createQueryBuilder('user_post')
      .leftJoinAndSelect('user_post.user', 'user')
      .where('user_post.id_img = :id', { id: post_id })
      .getOne();

    if (post.user.id != user.id) return;
    const postLikes = await getConnection()
      .getRepository(LikePost)
      .createQueryBuilder('likePost')
      .leftJoinAndSelect('likePost.post', 'post')
      .where('likePost.post = :id', { id: post.id_img })
      .getMany();

    this.like_postRepository.remove(postLikes);
    this.user_postRepository.remove(post);

    fs.unlink(`./public/img/postedPic/${post_id}.jpg`, (err) => {
      if (err) throw err;
    });
  }
}
