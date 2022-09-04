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

const imageFilter = function(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';      
      return cb(null, false);
  }
  cb(null, true);
};

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly appService: AppService,
  ) {}

  @Get()
  async renderPostPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    return res.render('post', { user: user });
  }

  @Get('delete/:id')
  async deletePost(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    await this.postService.deletePost(user, req.params.id);
    res.json('');
    res.end();
  }

  @Get('/:id')
  async renderPost(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    const postInfo = await this.postService.getPostInfo(req.params.id);
    const post = await this.appService.getLikes(user, [postInfo]);

    if (user) {
      user['owner'] = await this.postService.isOwner(user, req.params.id);
      return res.render('postImg', { user: user, post: post[0] });
    } else return res.render('postImg', { post: post[0] });
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', { dest: 'public/img/rowImg', 
    limits : { fileSize: 1024 * 1024 * 50, files: 1, }, 
    fileFilter : imageFilter, }))
  async downloadPic(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.appService.getUser(req);
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
