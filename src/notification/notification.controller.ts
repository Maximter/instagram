import {
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from 'src/app.service';
import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly appService: AppService,) {}

  @Get()
  async renderPostPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    if (!user) return;

    const notification = await this.notificationService.getNotifications(user);    
    return res.render('notification', { user: user, notification : notification });
  }
}
