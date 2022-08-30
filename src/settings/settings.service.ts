import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { VerificationService } from 'src/verification/verification.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

const saltForHash = 7;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly verificationService: VerificationService,
  ) {}

  async valid_data(user, req): Promise<object> {
    const body = req.body;
    const validEmail: RegExp = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const validNameLastname: RegExp = /^[a-zA-Zа-яА-Я ]+$/;

    const email = body.email.trim(),
      name_lastname = body.name_lastname.trim(),
      username = body.username.trim(),
      bio = body.bio.trim();

    if (!validEmail.test(email))
      return { valid: false, err: 'Введен неверный эл. адрес', bio: bio };
    if (!validNameLastname.test(name_lastname))
      return {
        valid: false,
        err: 'Имя и фамилия должны содержать только буквы',
        bio: bio,
      };

    if (name_lastname.length < 4)
      return {
        valid: false,
        err: 'Слишком короткое Имя и фамилия',
        bio: bio,
      };
    if (name_lastname.length >= 40)
      return { valid: false, err: 'Слишком длинное Имя и фамилия', bio: bio };
    if (username.length < 4)
      return {
        valid: false,
        err: 'Слишком короткое Имя пользователя',
        bio: bio,
      };
    if (username.length >= 40)
      return {
        valid: false,
        err: 'Слишком длинное Имя пользователя',
        bio: bio,
      };
    if (bio.length >= 300)
      return {
        valid: false,
        err: 'Слишком длинное описание пользователя',
        bio: bio,
      };

    if (username != user.username) {
      const check_username = await this.userRepository.findOne({
        where: { username: username },
      });
      if (check_username != undefined)
        return {
          valid: false,
          err: 'Введенное имя пользователя уже занято',
          bio: bio,
        };
    }

    user.name_lastname = name_lastname;
    user.username = username;
    user.bio = bio;
    await this.userRepository.save(user);

    if (user.email != email) {
      const taken = await this.checkEmail(email);
      if (taken) {
        return {
          valid: true,
          err: '',
          warn: 'Введённая почта занята другим пользователем',
          user: {},
        };
      } else {
        this.verificationService.changeEmail(user, email, req);

        return {
          valid: true,
          err: '',
          warn: `На Email ${user.email} была выслана ссылка для подтверждения изменения почты`,
          user: {},
        };
      }
    }

    return { valid: true, err: '', user: {} };
  }

  async checkEmail(email): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (user) return true;
    else return false;
  }

  async valid_pass(user, req): Promise<object> {
    const oldPass = req.body['old-pass'],
      newPass = req.body['new-pass'],
      newPass2 = req.body['new-pass2'];

    if (newPass.length < 8)
      return {
        valid: false,
        err: 'Введен слишком короткий пароль',
      };
    if (newPass.length > 65)
      return { valid: false, err: 'Введен слишком длинный пароль' };

    if (newPass != newPass2) {
      return {
        valid: false,
        err: 'Введённые новые пароли не совпадают',
      };
    }
    if (await bcrypt.compare(oldPass, user.password)) {
      const hashPassword: string = await bcrypt.hash(newPass, saltForHash);
      user.password = hashPassword;

      await this.userRepository.save(user);
      return { valid: true };
    } else {
      return {
        valid: false,
        err: 'Неверно введён текущий пароль',
      };
    }
  }

  async change_avatar(user, file): Promise<void> {
    user.avatar = true;
    this.userRepository.save(user);

    fs.rename(
      `./public/img/rowImg/${file.filename}`,
      `./public/img/avatar/${user.id}.jpg`,
      function (err) {
        if (err) console.log('ERROR: ' + err);
      },
    );
  }
}
