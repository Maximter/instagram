import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';
import { Follow } from 'entity/follower.entity';
import { LikePost } from 'entity/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token, Follow, LikePost])],
  controllers: [FollowController],
  providers: [FollowService, AppService],
})
export class FollowModule {}
