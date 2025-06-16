import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ParserMainSchedule {
  private readonly logger = new Logger(ParserMainSchedule.name);

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron(callback?: () => void) {
    this.logger.debug('Запуск задачи каждые 10 секунд');
    if (callback) {
      callback();
    }
  }

  // Method to set a custom callback
  setScheduledTask(task: () => void) {
    this.handleCron = () => {
      this.logger.debug('Запуск задачи каждые 10 секунд');
      task();
    };
  }
}