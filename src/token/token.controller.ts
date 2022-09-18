import { Controller, Get, Req, Res } from '@nestjs/common';
import { TokenService } from './token.service';
import { Request, Response } from 'express';
import axios from 'axios';
import { LoginService } from 'src/login/login.service';
import * as uuid from 'uuid';

@Controller('token')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly loginService: LoginService
    ) {}

  @Get('/yandex')
  async getToken(@Req() req: Request, @Res() Res: Response) {
    const code = req.query.code    
    const CLIENT_ID = 'a8fc1d2ca1434b31b9e36b8ef23d4f35'
    const CLIENT_SECRET = '279e7542f53349ac83bb90adaaa1dd22'
    const JWT_SECRET = '279e7542f53349ac83bb90adaaa1dd22'

    const body = `grant_type=authorization_code&code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    let answer
    axios.post('https://oauth.yandex.ru/token', body)
    .then((res) => {
        answer = res.data;
        axios.get(`https://login.yandex.ru/info?jwt_secret=${JWT_SECRET}&oauth_token=${answer.access_token}`)
        .then(async (res) => {     
            const userExist = await this.tokenService.findUser(res.data.default_email);
            if (userExist) {
              Res.cookie('instyle_token', await this.loginService.getToken(userExist), {
                httpOnly: true,
              });
              return Res.redirect('/');
            } else {
              let password = await uuid.v4();
              password = password.slice(0, 12);
              res.data.password = password;
              const user = await this.tokenService.saveUser(res.data);
              this.tokenService.sendEmail(res.data);
              Res.cookie('instyle_token', await this.loginService.getToken(user), {
                httpOnly: true,
              });
              return Res.render('login', { success : 'Вы были успешно зарегистрированы. Временный пароль был отправлен на эл. почту. Для изменения пароля зайдите в настройки приложения' } )
            }
        }).catch((err) => {
            console.error(err);
            Res.writeHead(302, { Location: `/login` });
            return Res.end();
        });
    }).catch((err) => {
      console.log(err);
      Res.writeHead(302, { Location: `/login` });
      return Res.end();
    });
  }
}
