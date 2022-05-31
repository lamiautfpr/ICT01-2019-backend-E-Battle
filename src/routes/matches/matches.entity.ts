import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from '../games/games.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game)
  game: Game;

  @Column()
  spaces: number;

  @Column()
  groups: string[];

  @Column()
  ramdom: boolean;

  @Column()
  trivia: boolean;

  @ApiHideProperty()
  @CreateDateColumn({ select: false })
  createdDate: Date;
}
