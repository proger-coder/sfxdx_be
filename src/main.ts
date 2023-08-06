import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // валидируем DTO-шки
  await app.listen(3000, () => console.log('Sfxdx is listening on port 3000!'));
}
bootstrap();
