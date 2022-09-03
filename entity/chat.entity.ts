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
    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn({ length : 65 })
    id_chat : string;
  
    @ManyToOne(() => User)
    @JoinColumn()
    member: User;

    @Column({ default : 0 })
    unread? : number;
  } 
  