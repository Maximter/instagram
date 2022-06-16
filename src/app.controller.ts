import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async RenderPageWithUser(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    const postsInfo = await this.appService.getPosts(user);
    const posts = await this.appService.getLikes(user, postsInfo);
    return res.render('index', { user: user, posts: posts });
  }
}
