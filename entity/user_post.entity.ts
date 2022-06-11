import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class User_post {
  @PrimaryColumn({ unique: true })
  id_img : number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  @IsNotEmpty()
  date_post: string;

  @Column({ length: 1500 })
  comment: string;
}