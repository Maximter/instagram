import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikePost } from 'entity/like.entity';
import { User } from 'entity/user.entity';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class RecommendationService {
    constructor(    
        @InjectRepository(LikePost)
        private like_postRepository: Repository<LikePost>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
      ) {}

    async getPopularPosts(): Promise<object[]> {
        const weekAgo = Date.now() - 604800000;
        const allLikes = await getConnection()
            .getRepository(LikePost)
            .createQueryBuilder('likePost')
            .leftJoinAndSelect('likePost.post', 'post')
            .where('post.date_post > :date', { date: weekAgo })
            .take(20)
            .getMany();

        let countLikes = [[allLikes[0].post.id_img, 1]];

        for (let i = 1; i < allLikes.length; i++) {
            for (let j = 0; j < countLikes.length; j++) {
                if (countLikes[j][0] == allLikes[i].post.id_img) {
                    countLikes[j][1]++;
                    break;
                }
                if (countLikes.length - 1 == j) {
                    countLikes.push([allLikes[i].post.id_img, 1]);
                    break;
                }

            }
        }      
        countLikes.sort(this.compareSecondColumn);
        countLikes.reverse();        

        return countLikes;
    }

    async findUser(username) {
        const userInfo = await this.userRepository.findOne({
            where: { username: username },
        });

        if (userInfo) {
            const { password, email, bio, verificated, ...user } = userInfo;
            return user
        } else return undefined;
    }

    
    compareSecondColumn(a, b) {
        if (a[1] === b[1]) return 0;
        else return (a[1] < b[1]) ? -1 : 1;
    }
}
