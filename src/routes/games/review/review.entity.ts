import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Game } from '../games.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: number;

  @ManyToOne(() => Game)
  game: number;

  @Column()
  score: number;

  @ApiHideProperty()
  @CreateDateColumn({ select: false })
  date: Date;
}
