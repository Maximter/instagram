import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { VerificationService } from 'src/verification/verification.service';
import { Repository } from 'typeorm';

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
}
