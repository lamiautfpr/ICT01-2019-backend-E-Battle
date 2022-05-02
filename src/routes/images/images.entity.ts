import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column({
    type: 'longblob',
  })
  data: Buffer;
}
