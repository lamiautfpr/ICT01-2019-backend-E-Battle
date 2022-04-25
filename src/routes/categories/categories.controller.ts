import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { CategoriesService } from './categories.service';

@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description:
      'Endpoint para listar categorias disponíveis para ser utilizado no sistema',
  })
  @Get('')
  getAll() {
    return this.categoriesService.findAll();
  }
}
