import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { User } from 'entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { VerificationService } from 'src/verification/verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  controllers: [SignupController],
  providers: [SignupService, NodemailerService, VerificationService],
})
export class SignupModule {}
