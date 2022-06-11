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
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { User_post } from 'entity/user_post.entity';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User, Token, User_post]),
    MailerModule.forRoot({
      transport: {
        host: process.env.YANDEX_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.YANDEX_EMAIL,
          pass: process.env.YANDEX_PASSWORD,
        },
      },
      defaults: {
        from: `Instyle <${process.env.YANDEX_EMAIL}>`,
      },
    }),
    LoginModule,
    SignupModule,
    VerificationModule,
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AppController, UserController);
  }
}
