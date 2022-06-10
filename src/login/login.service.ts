import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Token } from 'entity/token.entity';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async validUser(req, body): Promise<object> {
    const validEmail: RegExp = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const username = body.username.trim(),
      password = body.password;
    let user;

    if (validEmail.test(username)) {
      user = await this.userRepository.findOne({
        where: { email: username },
      });
    } else {
      user = await this.userRepository.findOne({
        where: { username: username },
      });
    }

    if (user != undefined && (await bcrypt.compare(password, user.password))) {
      if (user.verificated) return { valid: true };
      else {
        // TODO Отправить письмо
        return {
          valid: false,
          warn: 'Ваш эл. адрес не был подтверждён. Для получения доступа к сервису перейдите по ссылке из отправленного письма',
          user: user,
        };
      }
    } else
      return {
        valid: false,
        err: 'Введен неверный логин или пароль',
        user: user,
      };
  }

  async getToken(body): Promise<string> {
    const validEmail: RegExp = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const username = body.username.trim();
    let user;

    if (validEmail.test(username)) {
      user = await this.userRepository.findOne({
        where: { email: username },
      });
    } else {
      user = await this.userRepository.findOne({
        where: { username: username },
      });
    }

    const tokenData = await this.tokenRepository.findOne({
      where: { user: user },
    });

    return tokenData.token;
  }
}
