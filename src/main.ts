import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('BukGuide.com Documentation')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('API Service')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swg', app, document);

  app.enableCors({
    origin: true,
  });
  app.setGlobalPrefix('api');

  app.use('/image', express.static('public')); // Đường dẫn tới thư mục public

  await app.listen(3000);
}
bootstrap();
