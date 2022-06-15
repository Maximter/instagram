import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id : number;

  @ManyToOne(() => User)
  @JoinColumn()
  follower: User;

  @ManyToOne(() => User)
  @JoinColumn()
  following: User;
}