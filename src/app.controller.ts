import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { RecommendationService } from './recommendation/recommendation.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly recommendstionService: RecommendationService) {}

  @Get()
  async RenderPageWithUser(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    const postsInfo = await this.appService.getPosts(user);
    const posts = await this.appService.getLikes(user, postsInfo);
    let recommendation;
    if (posts.length == 0) {
      const countLikes = await this.recommendstionService.getPopularPosts();
      const popularPostsInfo = await this.recommendstionService.getPopularPostsFullData(countLikes);
      recommendation = await this.appService.getLikes(user, popularPostsInfo);
    }
  
    return res.render('index', { user: user, posts: posts, recommendation : recommendation });
  }
}
