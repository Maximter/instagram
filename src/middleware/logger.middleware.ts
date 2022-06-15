import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { getConnection, Repository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.route.path == '/post/:id') {
      next();
      return 0;
    }

    const tokenClient = req.cookies['instyle_token'];
    const tokenServer = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: req.cookies['instyle_token'] })
      .getOne();
    if (
      tokenServer == undefined ||
      tokenClient == undefined ||
      !tokenServer.user.verificated
    )
      res.redirect('/login');
    else next();
  }
}
