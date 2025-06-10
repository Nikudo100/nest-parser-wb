import { Injectable, Logger } from '@nestjs/common';
import { ParserFetchService } from './parser.fetch.service';
import { ParserDatabaseService } from './parser.database.service';
import { allOurProductsNmid } from '../storage/allOurProductsNmid';

@Injectable()
export class ParserLogicService {
  private readonly logger = new Logger(ParserLogicService.name);

  constructor(
    private readonly fetchService: ParserFetchService,
    private readonly dbService: ParserDatabaseService,
  ) {}

  /**
   * Алгоритм 1: Получение всех категорий, к которым привязаны товары нашего бренда
   */
  async runBrandCategoryParser(brandId: number): Promise<void> {
    try {
      this.logger.log(`Запуск алгоритма 1: парсинг категорий бренда ${brandId}`);

      // Пример URL: https://www.wildberries.ru/brands/312106698-stikdesign
      // Нужно найти способ получить список категорий через API или спарсить страницу (можно добавить Puppeteer)

      // TODO: Реализация получения категорий по ID бренда
    } catch (err) {
      this.logger.error('Ошибка в runBrandCategoryParser:', err);
    }
  }

  /**
   * Алгоритм 2: Получение похожих товаров по каждому нашему товару
   */
  async runSimilarProductsParser(): Promise<void> {
    this.logger.log('Запуск алгоритма 2: парсинг похожих товаров');

    for (const nmid of allOurProductsNmid) {
      try {
        const url = `https://recom.wb.ru/visual/ru/common/v5/search?appType=1&curr=rub&dest=-1257786&hide_dtype=13&lang=ru&page=1&query=${nmid}&resultset=catalog&spp=30&suppressSpellcheck=false`;
        const data = await this.fetchService.fetchJson(url);

        const similarProducts = data?.data?.products || [];

        for (const item of similarProducts) {
          const product = await this.fetchService.fetchProductCard(item.id);
          await this.dbService.saveProductToDB(product);
        }
      } catch (err) {
        this.logger.warn(`Ошибка при обработке NMID=${nmid}: ${err.message}`);
      }
    }
  }
  
  test() {
    return 'test 123 1';
  }
}
