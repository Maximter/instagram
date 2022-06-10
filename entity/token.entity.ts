import {
  Entity,
  BaseEntity,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Token extends BaseEntity {
  @PrimaryColumn({ unique: true, length: 65 })
  token: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
} 
