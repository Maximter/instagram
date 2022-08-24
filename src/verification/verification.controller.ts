import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';

@Controller('verification')
export class VerificationController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  async renderVerification(@Res() res: Response, @Query() query) {
    const user = await this.userRepository.findOne({
      where: { id: query.id, email: query.email },
    });

    if (user == undefined) res.redirect('/login');

    user.verificated = true;
    this.userRepository.save(user);
    return res.render('verification', { signup: true });
  }

  @Get('confirm-email')
  async confirm_email(@Res() res: Response, @Query() query) {
    const user = await this.userRepository.findOne({
      where: { id: query.id, password: query.pass },
    });

    if (user == undefined) res.redirect('/');

    user.email = query.email;
    this.userRepository.save(user);
    return res.render('verification', { confirmEmail: true });
  }
}
