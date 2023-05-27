import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // evita que campos que nao existem no dto aparecam no corpo da requisicao
    }),
  );
  await app.listen(3000);
}
bootstrap();
