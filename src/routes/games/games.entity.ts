import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
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

  @Column({ name: 'userId' })
  userId: number;

  @ManyToOne(() => Language)
  language: Language;

  @Column({ name: 'languageId' })
  languageId: number;

  @ManyToOne(() => Category)
  category: Category;

  @Column({ name: 'categoryId' })
  categoryId: number;

  @Column()
  name: string;

  @Column({
    default: 0,
  })
  visibility: number;

  @Column({
    type: 'json',
  })
  questions: Question[];

  @ApiHideProperty()
  @CreateDateColumn({ select: false })
  createdDate: Date;

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
