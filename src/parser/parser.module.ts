import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { ParserController } from './controllers/parser.controller';
import { ParserLogicService } from './services/parser.logic.service';
import { ParserMainSchedule } from './schedule/parser.main.schedule';
import { ParserDatabaseService } from './services/parser.database.service';
import { ParserFetchService } from './services/parser.fetch.service';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    ParserLogicService,
    ParserMainSchedule,
    ParserDatabaseService,
    ParserFetchService,
  ],
  controllers: [ParserController],
})
export class ParserModule { }