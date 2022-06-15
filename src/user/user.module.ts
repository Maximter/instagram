import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppService } from 'src/app.service';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';
import { User_post } from 'entity/user_post.entity';
import { Follow } from 'entity/follower.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token, User_post, Follow])],
  controllers: [UserController],
  providers: [UserService, AppService],
})
export class UserModule {}
