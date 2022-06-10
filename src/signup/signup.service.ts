import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { Token } from 'entity/token.entity';

const saltForHash = 7;

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async validUser(body): Promise<object> {
    const validEmail: RegExp = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const validNameLastname: RegExp = /^[a-zA-Zа-яА-Я ]+$/;

    const email = body.email.trim(),
      name_lastname = body.name_lastname.trim(),
      username = body.username.trim(),
      password = body.password;

    if (!validEmail.test(email))
      return { valid: false, err: 'Введен неверный эл. адрес', user: body };
    if (!validNameLastname.test(name_lastname))
      return {
        valid: false,
        err: 'Имя и фамилия должны содержать только буквы',
        user: body,
      };
    if (password.length < 8)
      return {
        valid: false,
        err: 'Введен слишком короткий пароль',
        user: body,
      };
    if (password.length > 65)
      return { valid: false, err: 'Введен слишком длинный пароль', user: body };
    if (name_lastname.length < 4)
      return {
        valid: false,
        err: 'Слишком короткое Имя и фамилия',
        user: body,
      };
    if (name_lastname.length >= 40)
      return { valid: false, err: 'Слишком длинное Имя и фамилия', user: body };
    if (username.length < 4)
      return {
        valid: false,
        err: 'Слишком короткое Имя пользователя',
        user: body,
      };
    if (username.length >= 40)
      return {
        valid: false,
        err: 'Слишком длинное Имя пользователя',
        user: body,
      };

    let user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (user != undefined)
      return {
        valid: false,
        err: 'Введенная почта принадлежит другому пользователю',
        user: body,
      };

    user = await this.userRepository.findOne({
      where: { username: username },
    });
    if (user != undefined)
      return {
        valid: false,
        err: 'Введенное имя пользователя уже занято',
        user: body,
      };

    return { valid: true, err: '', user: {} };
  }

  async saveUser(body): Promise<void> {
    const hashPassword: string = await bcrypt.hash(body.password, saltForHash);
    const user: User = this.userRepository.create({
      email: body.email.trim(),
      username: body.username.trim(),
      name_lastname: body.name_lastname.trim(),
      password: hashPassword,
    });
    await this.userRepository.save(user);

    const createdUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    const token: Token = this.tokenRepository.create({
      user: createdUser,
      token: await uuid.v4(),
    });

    this.tokenRepository.save(token);
  }
}
