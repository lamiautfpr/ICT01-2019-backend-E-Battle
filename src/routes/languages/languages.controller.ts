import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { LanguagesService } from './languages.service';

@ApiBearerAuth()
@Controller('languages')
export class LanguagesController {
  constructor(private languagesService: LanguagesService) {}
  @UseGuards(JwtAuthGuard)
  @Get('')
  getAll() {
    return this.languagesService.findAll();
  }
}