import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { getConnection, Repository } from 'typeorm';
import { Token } from 'entity/token.entity';

@Controller('verification')
export class VerificationController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  @Get()
  async renderVerification(@Res() res: Response, @Query() query) {
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token = :token', { token: query.t })
      .getOne();

    if (tokenEntity == undefined) res.redirect('/login');

    tokenEntity.user.verificated = true;
    this.userRepository.save(tokenEntity.user);
    return res.render('verification', { signup: true });
  }

  @Get('confirm-email')
  async confirm_email(@Res() res: Response, @Query() query) {
    const tokenEntity = await getConnection()
    .getRepository(Token)
    .createQueryBuilder('token')
    .leftJoinAndSelect('token.user', 'user')
    .where('token = :token', { token: query.t })
    .getOne();

    if (tokenEntity == undefined) res.redirect('/login');
    tokenEntity.user.email = query.email;
    this.userRepository.save(tokenEntity.user);
    return res.render('verification', { confirmEmail: true });
  }
}
