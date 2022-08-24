import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id? : number;

  @Column({ unique: true, length: 45 })
  @IsEmail()
  email: string;

  @Column({ length: 40 })
  @IsNotEmpty()
  name_lastname: string;

  @Column({ unique: true, length: 20 })
  @IsNotEmpty()
  username: string;

  @Column({ length: 65 })
  @IsNotEmpty()
  password: string;

  @Column({ length: 300 })
  bio?: string;

  @Column({ default: false })
  avatar? : boolean;

  @Column({ default: false })
  private? : boolean;

  @Column({ default: false })
  verificated? : boolean;
}