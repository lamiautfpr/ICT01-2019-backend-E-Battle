import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguagesController } from './languages.controller';
import { Language } from './languages.entity';
import { LanguagesService } from './languages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Language])],
  controllers: [LanguagesController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
