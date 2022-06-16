import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AppService } from 'src/app.service';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly appService: AppService,
  ) {}

  @Get()
  async renderPostPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    if (!user) return;
    return res.render('post', { user: user });
  }

  @Get('/:id')
  async renderPost(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    const postInfo = await this.postService.getPostInfo(req.params.id);
    const post = await this.appService.getLikes(user, [postInfo]);

    if (user) return res.render('postImg', { user: user, post: post[0] });
    else return res.render('postImg', { post: post[0] });
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', { dest: 'public/img/rowImg' }))
  async downloadPic(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.appService.getUser(req);
    if (!user) return;
    const validData = await this.postService.checkValidData(
      file,
      req.body.comment,
    );
    if (!validData['valid'])
      return res.render('post', {
        user: user,
        comment: req.body.comment,
        err: validData['err'],
      });

    this.postService.savePicture(file, req.body.comment, user);
    return res.render('post', {
      user: user,
      success: 'Фотография будет загружена через несколько секунд',
    });
  }

  @Post('/like/:id_post')
  async likePost(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    this.postService.like(user, req.params.id_post);
    res.end();
  }
}
