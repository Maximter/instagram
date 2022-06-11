import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';
import { User_post } from 'entity/user_post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token, User_post])],
  controllers: [PostController],
  providers: [PostService, AppService]
})
export class PostModule {}
