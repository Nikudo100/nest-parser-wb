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

  /**
   * Алгоритм 2: Получение похожих товаров по каждому нашему товару
   */
  async runSimilarProductsParser(): Promise<void> {
    this.logger.log('Запуск алгоритма 2: парсинг похожих товаров');

    for (const nmid of allOurProductsNmidTEST) {
      try {
        const url = `https://recom.wb.ru/visual/ru/common/v5/search?appType=1&curr=rub&dest=-1257786&hide_dtype=13&lang=ru&page=1&query=${nmid}&resultset=catalog&spp=30&suppressSpellcheck=false`;
        const data = await this.fetchService.fetchJson(url);

        const similarProducts = data?.data?.products || [];

        for (const item of similarProducts) {
          const product = await this.fetchService.fetchProduct(Number(item.id));
          this.logger.log(await this.dbService.saveProductToDB(product));
        }
      } catch (err) {
        this.logger.warn(`Ошибка при обработке NMID=${nmid}: ${err.message}`);
      }
    }
  }

  async runCardJsonParser(): Promise<void> {
    this.logger.log('Запуск получения card.json для всех товаров');

    for (const nmid of allOurProductsNmidTEST) {
      try {
        const cardData = await this.fetchService.fetchProductCardJson(Number(nmid));

        this.logger.log(`Получен card.json для NMID=${nmid}: ${cardData?.imt_name || 'без имени'}`);

        this.dbService.saveCartJson(Number(nmid), cardData)
      } catch (err) {
        this.logger.warn(`Не удалось получить card.json для NMID=${nmid}: ${err.message}`);
      }
    }
  }


  test() {
    return 'test 123 1';
  }
}
