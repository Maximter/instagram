import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AppService } from 'src/app.service';
import { ChatService } from './chat.service';
import { Request, Response, Express } from 'express';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly appService: AppService,
    ) {}

  @Get()
  async renderPostPage(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    const chats = await this.chatService.getChats(user);
    
    return res.render('chat', { user: user, chats : chats });
  }

  @Get('getMessages')
  async getMessages(@Req() req: Request, @Res() res: Response) {    
    const user = await this.appService.getUser(req);
    const messages = await this.chatService.getMessagesById(
      req.query.id_chat,
      user.id,
    );
    return res.json(messages);
  }

  @Get('getNewMessages')
  async getNewMessages(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    let messages;

    if (req.query.activeConversation != undefined && req.query.activeConversation != 'none') 
      messages = await this.chatService.getMessagesById(
        req.query.activeConversation,
        user.id,
        req.query.lastId
      );
    else 
      messages = await this.chatService.getMessages(user, { id : req.query.idInterlocutor }, req.query.lastId);    

    return res.json(messages);
  }
  

  @Get('read')
  async read(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    this.chatService.readMessage(req.query.id_chat, user.id);
    return res.end()
  }

  @Get('unread')
  async unread(@Req() req: Request, @Res() res: Response) {
    const user = await this.appService.getUser(req);
    this.chatService.unreadMessage(req.query.id_chat, user.id);
    return res.end()
  }

  @Get('/:username')
  async renderChat(@Req() req: Request, @Res() res: Response) {    
    const user = await this.appService.getUser(req);
    const chats = await this.chatService.getChats(user);    
    const interlocutor = await this.chatService.getInterlocutor(req.params.username);
    if (!interlocutor) return;  
    const messages = await this.chatService.getMessages(user, interlocutor);    
    return res.render('chat', { user: user, chats : chats,  interlocutor : interlocutor, messages : messages });
  }
}
