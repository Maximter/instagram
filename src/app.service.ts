import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { getConnection, Repository } from 'typeorm';
import * as fs from 'fs';
import { User } from 'entity/user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async getUser(req): Promise<User> {
    const token = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: req.cookies['instyle_token'] })
      .getOne();
    if (token == undefined) throw new UnauthorizedException();
    if (!token.user.avatar) delete token.user.avatar;
    return token.user;
  }
}
