import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';
import { User_post } from 'entity/user_post.entity';
import { Follow } from 'entity/follower.entity';
import { LikePost } from 'entity/like.entity';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Message } from 'entity/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, User_post, Follow, LikePost, Chat, ChatInfo, Message]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, AppService],
})
export class RecommendationModule {}
