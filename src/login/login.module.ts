import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { VerificationService } from 'src/verification/verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  controllers: [LoginController],
  providers: [LoginService, NodemailerService, VerificationService],
})
export class LoginModule {}
