import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('E-Battle Api')
    .setDescription(
      'Api para integração de uma plataforma web com o projeto ICT01-2019 E-Battle que, por sua vez, é um jogo educacional que tem como objetivo estimular o aprendizado em sala de aula por meio da competição saudável entre os jogadores.',
    )
    .setVersion('0.2.2')
    .addBearerAuth()
    .addTag('Development', 'APENAS PARA TESTES E DESENVOLVIMENTO')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}

bootstrap();
