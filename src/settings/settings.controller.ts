import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from 'src/app.service';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly appService: AppService,
  ) {}

  @Get()
  async renderPostPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    return res.render('settings', { user: user });
  }

  @Post('change-profile')
  async change_profile(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    if (!user) return;

    const valid_data = await this.settingsService.valid_data(user, req);
    if (!valid_data['valid'])
      return res.render('settings', {
        err: valid_data['err'],
        bio: valid_data['bio'],
        user: user,
      });
    else
      return res.render('settings', {
        user: user,
        success: 'Введённые данные были сохранены',
        warn: valid_data['warn'],
      });
  }
}
