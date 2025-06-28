import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ParserLogicService } from '../services/parser.logic.service';

@Injectable()
export class ParserMainSchedule {
  private readonly logger = new Logger(ParserMainSchedule.name);

  constructor(private readonly parserLogicService: ParserLogicService) { }

  @Cron('0 20 13 * * *', { timeZone: 'Europe/Moscow' })
  async handleCron() {
    this.logger.debug('⏰ [12:00] Запуск runSimilarProducts()');
    try {
      await this.parserLogicService.runSimilarProducts();
      this.logger.debug('✅ runSimilarProducts() выполнен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при выполнении runSimilarProducts()', error);
    }
  }
  @Cron('0 22 13 * * *', { timeZone: 'Europe/Moscow' })
  async handleCron1() {
    this.logger.debug('⏰ [12:00] Запуск runSimilarProducts()');
    try {
      await this.parserLogicService.runSimilarProducts();
      this.logger.debug('✅ runSimilarProducts() выполнен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при выполнении runSimilarProducts()', error);
    }
  }

  @Cron('0 21 13 * * *', { timeZone: 'Europe/Moscow' })
  async handleCron2() {
    this.logger.debug('⏰ [12:00] Запуск runCardJson()');
    try {
      await this.parserLogicService.runCardJson();
      this.logger.debug('✅ runCardJson() выполнен успешно');
    } catch (error) {
      this.logger.error('❌ Ошибка при выполнении runCardJson()', error);
    }
  }

  // Каждые 10 секунд логгер
  @Cron('*/60 * * * * *')
  handleDebugCron() {
    this.logger.debug('🕒 Scheduler is working (60  s interval)');
  }

}