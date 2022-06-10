import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from '../entity/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { SignupModule } from './signup/signup.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User, Token,]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.yandex.com',
        port: 465,
        secure: true,
        auth: {
          user: 'm-a-x-o-k@yandex.ru',
          pass: 'Vfrcbv7895123)))03',
        },
      },
      defaults: {
        from: 'Instyle <m-a-x-o-k@yandex.ru>',
      },
    }),
    LoginModule,
    SignupModule,
    VerificationModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AppController);
  }
}
