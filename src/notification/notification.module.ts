import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';
import { User_post } from 'entity/user_post.entity';
import { Follow } from 'entity/follower.entity';
import { LikePost } from 'entity/like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, User_post, Follow, LikePost]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, AppService]
})
export class NotificationModule {}
