import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from 'src/app.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly appService: AppService,
  ) {}

  @Get()
  async renderMainPage(@Req() req: Request, @Res() res: Response) {
    return res.redirect('/');
  }

  @Get('/:username')
  async renderUserPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    return res.render('profile', { user: user });
  }
}
