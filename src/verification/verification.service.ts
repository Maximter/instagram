import { Injectable } from '@nestjs/common';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { getConnection, Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Token } from 'entity/token.entity';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    private readonly mailerService: MailerService,
  ) {}

  async sendMessage(req, body): Promise<void> {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, '../../../views/mail/verificate.hbs'),
      'utf8',
    );
    const template = handlebars.compile(emailTemplateSource);
    let user;  

    if (body.email != undefined) {
      user = await this.userRepository.findOne({
        where: { email: body.email.trim() },
      });
    } else {
      user = await this.userRepository.findOne({
        where: { username: body.username.trim() },
      });

      if (user == undefined) {
        user = await this.userRepository.findOne({
          where: { email: body.username },
        });
      }     
    }
    
    if (user == undefined) return;

    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.user = :id', { id: user.id })
      .getOne();

    const link = `http://${req.get('host')}/verification?t=${tokenEntity.token}`;
    const htmlToSend = template({ link: link });

    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Верификация в Instyle',
        html: htmlToSend,
      })
      .then(() => {
        console.log('sent');
        
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async changeEmail(user, email, req): Promise<void> {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, '../../../views/mail/changeEmail.hbs'),
      'utf8',
    );
    const template = handlebars.compile(emailTemplateSource);

    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.user = :id', { id: user.id })
      .getOne();

    const confirmLink = `http://${req.get(
      'host',
    )}/verification/confirm-email?t=${tokenEntity.token}&email=${email}`;
    const settingsLink = `http://${req.get('host')}/settings`;
    const htmlToSend = template({
      confirmLink: confirmLink,
      settingsLink: settingsLink,
    });

    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Изменение эл. почты Instyle',
        html: htmlToSend,
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  }
}
