import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Image } from './images.entity';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @ApiOperation({
    description: 'Endpoint que retorna imagens baseada no ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da imagem',
    required: true,
  })
  @Get(':id')
  async get(@Param() params, @Response() res) {
    const image = await this.imagesService.findOne(params.id);
    if (image === undefined) {
      throw new NotFoundException('Imagem não encontrado');
    }
    const fileData = image.data;

    res.write(fileData);
    res.end();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    console.log(file);

    const image = new Image();
    image.data = file.buffer;
    image.fileName = file.fileName;

    const r = await this.imagesService.save(image);

    return r.id;
  }
}
