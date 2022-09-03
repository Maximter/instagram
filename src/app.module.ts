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
import { PostController } from './post/post.controller';
import { FollowModule } from './follow/follow.module';
import { Follow } from 'entity/follower.entity';
import { Like } from 'typeorm';
import { LikePost } from 'entity/like.entity';
import { SettingsModule } from './settings/settings.module';
import { NotificationModule } from './notification/notification.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { SettingsController } from './settings/settings.controller';
import { RecommendationController } from './recommendation/recommendation.controller';
import { NotificationController } from './notification/notification.controller';
import { RecommendationService } from './recommendation/recommendation.service';
import { ChatModule } from './chat/chat.module';
import { SocketService } from './gateway/app.gateway.service';
import { AppGateway } from './gateway/app.gateway';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Message } from 'entity/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User, Token, User_post, Follow, LikePost, Chat, ChatInfo, Message]),
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
    FollowModule,
    SettingsModule,
    NotificationModule,
    RecommendationModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, RecommendationService, SocketService, AppGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        AppController,
        UserController,
        PostController,
        SettingsController,
        RecommendationController,
        NotificationController,
      );
  }
}
