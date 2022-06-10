import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppService } from 'src/app.service';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  controllers: [UserController],
  providers: [UserService, AppService],
})
export class UserModule {}
