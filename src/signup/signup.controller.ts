import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { VerificationService } from 'src/verification/verification.service';
import { SignupService } from './signup.service';

@Controller('signup')
export class SignupController {
  constructor(
    private readonly signupService: SignupService,
    private readonly verificationService: VerificationService,
  ) {}

  @Get()
  async renderSignup(@Res() res: Response) {
    res.clearCookie('instyle_token');
    return res.render('signup');
  }

  @Post()
  async signupUser(@Body() body, @Req() req: Request, @Res() res: Response) {
    if (!body.email || !body.name_lastname || !body.username || !body.password)
      return;
    const validUser = await this.signupService.validUser(body);
    if (!validUser['valid'])
      return res.render('signup', {
        err: validUser['err'],
        user: validUser['user'],
      });

    await this.signupService.saveUser(body);
    this.verificationService.sendMessage(req, body);
    res.render('signup', {
      success:
        'Вы были успешно зарегистрированы. Для получения доступа к сервису, была выслана ссылка на эл. адрес для его подтверждения',
    });
  }
}
