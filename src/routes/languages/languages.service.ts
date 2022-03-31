import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './languages.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private categoriesRepository: Repository<Language>,
  ) {}

  findAll(): Promise<Language[] | undefined> {
    return this.categoriesRepository.find();
  }
}
