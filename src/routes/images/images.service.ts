import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './images.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
  ) {}

  findOne(id: number): Promise<Image | undefined> {
    return this.imagesRepository.findOne(id);
  }

  save(image: Image): Promise<Image> {
    return this.imagesRepository.save(image);
  }
}
