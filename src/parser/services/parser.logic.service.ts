import { Injectable, Logger } from '@nestjs/common';
import { ParserFetchService } from './parser.fetch.service';
import { ParserDatabaseService } from './parser.database.service';
import { allOurProductsNmid } from '../storage/allOurProductsNmid';
import { allOurProductsNmidTEST } from '../storage/allOurProductsNmidTEST';

@Injectable()
export class ParserLogicService {
  private readonly logger = new Logger(ParserLogicService.name);

  constructor(
    private readonly fetchService: ParserFetchService,
    private readonly dbService: ParserDatabaseService,
  ) {}

  async getProductByNmId(nmId: number): Promise<void> {
    this.logger.log('Запуск getProductByNmId');
        try {
          const product = await this.fetchService.fetchProduct(Number(nmId));
          this.logger.log(await this.dbService.saveProductToDB(product));
      } catch (err) {
        this.logger.warn(`Ошибка при обработке NMID=${nmId}: ${err.message}`);
      }
  }

  async runSimilarProducts(): Promise<void> {
    this.logger.log('Запуск алгоритма 2: парсинг похожих товаров');

    for (const nmId of allOurProductsNmidTEST) {
      try {
          const product = await this.fetchService.fetchProduct(Number(nmId));
          this.logger.log(await this.dbService.saveProductToDB(product));
      } catch (err) {
        this.logger.warn(`Ошибка при обработке NMID=${nmId}: ${err.message}`);
      }
    }
  }

  async runCardJson(): Promise<void> {
    this.logger.log('Запуск получения card.json для всех товаров');

    for (const nmid of allOurProductsNmidTEST) {
      try {
        const cardData = await this.fetchProductCardJson(Number(nmid));

        this.logger.log(`Получен card.json для NMID=${nmid}: ${cardData?.imt_name || 'без имени'}`);

        this.dbService.saveCartJson(Number(nmid), cardData)
      } catch (err) {
        this.logger.warn(`Не удалось получить card.json для NMID=${nmid}: ${err.message}`);
      }
    }
  }

  async fetchProductCardJson(nmId: number): Promise<any> {
    // First check if URL exists in database
    const existingUrl = await this.dbService.findCartUrl(nmId);
    if (existingUrl) {
        try {
            const data = await this.fetchService.fetchJson(existingUrl.url);
            return data;
        } catch (error) {
            this.logger.warn(`Failed to fetch from cached URL for nmId=${nmId}: ${error.message}`);
        }
    }

    const vol = Math.floor(nmId / 100000);
    const part = Math.floor(nmId / 1000);

    for (let i = 1; i <= 99; i++) {
        const subdomain = i.toString().padStart(2, '0');
        const url = `https://basket-${subdomain}.wbbasket.ru/vol${vol}/part${part}/${nmId}/info/ru/card.json`;

        try {
            const data = await this.fetchService.fetchJson(url);
            this.logger.log(`Successfully fetched data from URL: ${url}`);

            await this.dbService.saveCartUrl(nmId, url);

            return data;
        } catch (error) {
            if (!error.message.includes('404')) {
                this.logger.error(`Error fetching from URL: ${url}. Error: ${error.message}`);
                throw new Error(`Ошибка при получении card.json: ${error.message}`);
            }
            this.logger.warn(`404 Not Found for URL: ${url}`);
        }
    }

    throw new Error(`card.json не найден ни на одном из поддоменов для nmId=${nmId}`);
}


  test() {
    return 'test 123 1';
  }
}
