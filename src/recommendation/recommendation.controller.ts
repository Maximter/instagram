import { RecommendationService } from './recommendation.service';
import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { Request, Response } from 'express';

@Controller('recommendation')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly appService: AppService,
  ) {}

  @Get()
  async renderPostPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    const posts = await this.recommendationService.getPopularPosts();
    return res.render('recommendation', { user: user, post: posts });
  }

  @Get('find/:username')
  async findUser(@Req() req: Request, @Res() res: Response) {
    const user = await this.recommendationService.findUser(req.params.username);
    res.json(user);
    res.end();
  }
}
