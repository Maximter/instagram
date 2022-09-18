import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import axios from 'axios';
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
    if (posts == undefined) {
      const countLikes = await this.recommendstionService.getPopularPosts();
      const popularPostsInfo = await this.recommendstionService.getPopularPostsFullData(countLikes);
      recommendation = await this.appService.getLikes(user, popularPostsInfo);
    }
  
    return res.render('index', { user: user, posts: posts, recommendation : recommendation });
  }

  @Get('/token')
  async getToken(@Req() req: Request, @Res() res: Response) {
    let code = req.query.code
    console.log(code);

    const body = `grant_type=authorization_code&code=${code}&client_id=a8fc1d2ca1434b31b9e36b8ef23d4f35&client_secret=279e7542f53349ac83bb90adaaa1dd22`
    let answer
    axios.post('https://oauth.yandex.ru/token', body)
    .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data);
        answer = res.data;

        axios.get(`https://login.yandex.ru/info?jwt_secret=279e7542f53349ac83bb90adaaa1dd22&oauth_token=${answer.access_token}`)
        .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log('Body: ', res.data);
        }).catch((err) => {
            console.error(err);
        });
    }).catch((err) => {
        console.error(err);
        return;
    });

    // console.log(answer);
    
  
  }
}
