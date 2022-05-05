import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../categories/categories.entity';
import { Language } from '../languages/languages.entity';
import { User } from '../users/user.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: number;

  @ManyToOne(() => Language)
  language: Language;

  @ManyToOne(() => Category)
  category: Category;

  @Column()
  name: string;

  @Column({
    type: 'json',
  })
  questions: Question[];

  @ApiHideProperty()
  @DeleteDateColumn({ select: false })
  deletedDate: Date;
}

export class Question {
  text: string;

  // image: string;

  answers: string[];

  answer: number;

  time: number;
}
