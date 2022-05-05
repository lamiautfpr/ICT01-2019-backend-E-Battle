import { ApiHideProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @ApiHideProperty()
  @CreateDateColumn({ select: false })
  createdDate: Date;
}
