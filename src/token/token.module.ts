import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';
import { LoginService } from 'src/login/login.service';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { VerificationService } from 'src/verification/verification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token]),
  ],
  controllers: [TokenController],
  providers: [TokenService, LoginService, VerificationService, NodemailerService]
})
export class TokenModule {}
