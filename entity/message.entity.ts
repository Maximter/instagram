import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from './user.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length : 65 })
  chat: string;

  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @Column("text")
  content: string;

  @Column()
  sent_date: string;
}
