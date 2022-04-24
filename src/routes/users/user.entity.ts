import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
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
}
