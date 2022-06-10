import { Injectable } from '@nestjs/common';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

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
    }

    if (user == undefined) return;

    const link = `http://${req.get('host')}/verification?id=${user.id}&email=${
      user.email
    }`;
    const htmlToSend = template({ link: link });

    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Верификация в Instyle',
        html: htmlToSend,
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  }
}
