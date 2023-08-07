import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const port = 2023;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // валидируем DTO-шки

  const options = new DocumentBuilder()
    .setTitle('SFXDX API')
    .setDescription('Описание API')
    .setVersion('1.0')
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document); // Здесь 'api/docs' - это путь, по которому будет доступна документация

  await app.listen(port, () => console.log('Sfxdx is listening on port', port));
}
bootstrap();
