import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import * as path from 'path';
import handlebars from 'handlebars';
import { MailerService } from '@nestjs-modules/mailer';
let fs = require('fs')
const request = require('request');


@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    
        @InjectRepository(Token)
        private tokenRepository: Repository<Token>,

        private readonly mailerService: MailerService,
      ) {}


    async findUser(email) : Promise<User> | undefined {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });        
        
        return user
    }

    async saveUser(data) : Promise<User> {
        const hashPassword: string = await bcrypt.hash(data.password, 7);
        const busyUsername = await this.checkBusyUsername(data.login)
        if (busyUsername) data.login = `${data.login}${Math.floor(Math.random() * ((9999) + 1))}` 
        let avatarExist = false;
        if (!data.is_avatar_empty) avatarExist = true;

        const user: User = this.userRepository.create({
          email: data.default_email,
          username: data.login,
          name_lastname: data.real_name,
          password: hashPassword,
          verificated: true,
          avatar: avatarExist
        });
        await this.userRepository.save(user);
    
        const createdUser = await this.userRepository.findOne({
          where: { email: user.email },
        });

        if (!data.is_avatar_empty) this.downloadAvatars(data.default_avatar_id, createdUser.id);
        

        const token: Token = this.tokenRepository.create({
          user: createdUser,
          token: await uuid.v4(),
        });
    
        await this.tokenRepository.save(token);
        return createdUser;
    }

    async sendEmail(data) : Promise<void> {
        const emailTemplateSource = fs.readFileSync(
            path.join(__dirname, '../../../views/mail/getPassword.hbs'),
            'utf8',
          );
          const template = handlebars.compile(emailTemplateSource);
      
          const password = data.password;
          const htmlToSend = template({ password: password });
      
          this.mailerService
            .sendMail({
              to: data.default_email,
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

    async checkBusyUsername(username): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: { username: username },
        });  

        if (user) return true;
        else return false;
    }

    async downloadAvatars(avatar, id): Promise<void> {
        let download = function(uri, filename, callback){
            request.head(uri, function(err, res, body){          
                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
        };

        download(`https://avatars.yandex.net/get-yapic/${avatar}/islands-200`, 
                `./public/img/avatar/${id}.jpg`, function(){
        });

        download(`https://avatars.yandex.net/get-yapic/${avatar}/islands-retina-50`, 
                `./public/img/smallAvatar/${id}.jpg`, function(){
        });
    }
}
