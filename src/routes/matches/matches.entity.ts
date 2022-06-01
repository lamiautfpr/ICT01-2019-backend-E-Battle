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

  @Column({
    type: 'json',
  })
  groups: Group[];

  @Column()
  random: boolean;

  @Column()
  trivia: boolean;

  @ApiHideProperty()
  @CreateDateColumn({ select: false })
  createdDate: Date;
}

export class Group {
  name: string;

  players: string[];
}
