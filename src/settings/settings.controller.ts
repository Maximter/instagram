import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response, Express } from 'express';
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

  @Post('edit-profile')
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

  @Post('change-password')
  async change_password(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    if (!user) return;

    const valid_pass = await this.settingsService.valid_pass(user, req);
    if (!valid_pass['valid'])
      return res.render('settings', {
        err: valid_pass['err'],
        user: user,
      });
    else
      return res.render('settings', {
        user: user,
        success: 'Пароль был изменён',
        toLogin: true,
      });
  }

  @Post('change-avatar')
  @UseInterceptors(FileInterceptor('avatar', { dest: 'public/img/rowImg' }))
  async changeAvatar(
    @Req() req,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.appService.getUser(req);
    if (!file) return;

    this.settingsService.change_avatar(user, file);
    res.writeHead(302, { Location: `/user/${user.username}` });
    res.end();
  }
}
