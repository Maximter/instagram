import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from 'src/app.service';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(
    private readonly followService: FollowService,
    private readonly appService: AppService,
  ) {}

  @Post('/:username')
  async renderMainPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    await this.followService.follow(user, req.params.username);
    return res.redirect(req.headers.referer);
  }
}
