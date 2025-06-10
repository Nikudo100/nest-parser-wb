import { Module } from '@nestjs/common';
import { ParserController } from './controllers/parser.controller';
import { HttpModule } from '@nestjs/axios';
import { ParserLogicService } from './services/parser.logic.service';

@Module({
  imports: [HttpModule],
  providers: [ParserLogicService],
  controllers: [ParserController],
})
export class ParserModule {}
