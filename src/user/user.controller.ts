import { Controller, Get, Post, Req, Res } from '@nestjs/common';
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
    const owner = await this.userService.getOwner(req.params.username);
    if (user.id == owner.id) user['owner'] = true;
    else {
      const follow = await this.userService.isFollow(user, owner);
      if (follow) user['follow'] = true;
    }
    const follows = await this.userService.getfollows(owner);
    const posts = await this.userService.getPosts(owner);
    owner['countPost'] = posts.length;
    owner['countFollowers'] = follows['follower'];
    owner['countFollowings'] = follows['following'];

    return res.render('profile', { user: user, post: posts, owner: owner });
  }
}
