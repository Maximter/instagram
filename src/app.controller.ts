import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async RenderPageWithUser(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    return res.render('index', { user: user });
  }
}
