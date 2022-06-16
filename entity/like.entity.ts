import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from './user.entity';
import { User_post } from './user_post.entity';

@Entity()
export class LikePost {
  @PrimaryGeneratedColumn()
  id : number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => User_post)
  @JoinColumn()
  post: User_post;
}