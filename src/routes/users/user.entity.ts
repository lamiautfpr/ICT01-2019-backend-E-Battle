import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    default: 0,
  })
  status: number;

  @Column()
  institution: string;

  @Column()
  city: string;

  @Column()
  workType: string;

  @Column()
  educationLevel: string;

  @ApiHideProperty()
  @CreateDateColumn({ select: false })
  createdDate: Date;
}
