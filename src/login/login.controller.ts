import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginService } from './login.service';
import { VerificationService } from 'src/verification/verification.service';

@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly verificationService: VerificationService,
  ) {}

  @Get()
  renderLogin(@Res() res: Response) {
    res.clearCookie('instyle_token');
    return res.render('login');
    console.log('1');
  }

  @Post()
  async loginUser(@Req() req, @Body() body, @Res() res: Response) {
    if (!body.username || !body.password) return;
    const validUser: object = await this.loginService.validUser(req, body);

    if (validUser['valid']) {
      res.cookie('instyle_token', await this.loginService.getToken(body), {
        httpOnly: true,
      });
      return res.redirect('/');
    } else {
      if (validUser['err'])
        return res.render('login', {
          err: validUser['err'],
          user: validUser['user'],
        });
      else {
        return res.render('login', {
          warn: validUser['warn'],
          user: validUser['user'],
        });
      }
    }
  }
}
