import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
    ManyToOne,
    OneToMany,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity()
  export class Chat extends BaseEntity {
    @PrimaryColumn({ unique : true, length : 65 })
    chat_id : string;
  
    @ManyToOne(() => User)
    @JoinColumn()
    member: User;

    @Column({ default : 0 })
    unread : number;
  } 
  