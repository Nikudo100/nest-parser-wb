import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParserModule } from './parser/parser.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ParserModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
