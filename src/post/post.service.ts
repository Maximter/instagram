import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User_post } from 'entity/user_post.entity';
import e from 'express';
import * as fs from 'fs';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class PostService {
    constructor(    
        @InjectRepository(User_post)
        private user_postRepository: Repository<User_post>,
      ) {}

    async checkValidData (photo, comment): Promise<object> {
        if (photo == undefined) return { valid : false, err : 'Фотография не была загружена' }
        if (photo.size > 62914560) return { valid : false, err : 'Слишком большой размер файла' }
        if (comment.length > 1500) return { valid : false, err : 'Слишком длинное описание фотографии' }
        return { valid : true, err : '' }
    }
    
    async savePicture (photo, comment, user): Promise<void> {
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
            comment: comment
        });
        await this.user_postRepository.save(post);
    }

    async getPostInfo (id) {
      const post = await getConnection()
        .getRepository(User_post)
        .createQueryBuilder('user_post')
        .leftJoinAndSelect('user_post.user', 'user')
        .where('user_post.id_img = :id', { id: id })
        .getOne();

      return post
    }
}
