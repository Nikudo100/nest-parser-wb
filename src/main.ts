import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_SERVER_FRONT ?? 'http://localhost:3003',
  });
  await app.listen(process.env.PORT ?? 3004);
}

bootstrap();
