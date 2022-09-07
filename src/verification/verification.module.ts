import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { User } from 'entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
