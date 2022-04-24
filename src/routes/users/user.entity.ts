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
}

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn() // coloquei o nome como primary pq ele precisa ter uma, mas n sei se seria o nome mesmo, talvez o email
  name: string;

  @Column()
  email: string;

  @Column()
  institution: string;

  @Column()
  city: string;

  @Column()
  workType: string;   // talvez n seja apenas uma string, mas um campo para escolher entre algumas opções? não sei

  @Column()
  educationLevel: string;  // mesma dúvida do anterior
}