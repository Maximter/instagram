import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
    ManyToOne,
  } from 'typeorm';
import { Chat } from './chat.entity';
  import { User } from './user.entity';
  
  @Entity()
  export class ChatInfo extends BaseEntity {  
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chat: string;

    @Column()
    last_message_content : string;

    @Column()
    last_message_time : string;

    @ManyToOne(() => User)
    @JoinColumn()
    last_message_sender: User;
  } 
  