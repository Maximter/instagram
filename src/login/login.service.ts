import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Token } from 'entity/token.entity';
import { VerificationService } from 'src/verification/verification.service';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    private readonly verificationService: VerificationService,
  ) {}

  async validUser(req, body): Promise<object> {
    const username = body.username.trim(),
      password = body.password;
      
    let user = await this.userRepository.findOne({
      where: { email: username },
    });
    if (!user) user = await this.userRepository.findOne({
      where: { username: username },
    });

    if (user != undefined && (await bcrypt.compare(password, user.password))) {
      if (user.verificated) return { valid: true };
      else { 
        this.verificationService.sendMessage(req, body);
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
    const username = body.username.trim();
    let user = await this.userRepository.findOne({
      where: { email: username },
    });
    if (!user) user = await this.userRepository.findOne({
      where: { username: username },
    });
    
    const tokenData = await this.tokenRepository.findOne({
      where: { user: user.id },
    });

    return tokenData.token;
  }
}
