import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    value: function() {
      return this.toString();
    },
    configurable: true,
    writable: true
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
