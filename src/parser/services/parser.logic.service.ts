import { Injectable, Logger } from '@nestjs/common';
import { ParserFetchService } from './parser.fetch.service';
import { ParserDatabaseService } from './parser.database.service';
import { allOurProductsNmid } from '../storage/allOurProductsNmid';
import { allOurProductsNmidTEST } from '../storage/allOurProductsNmidTEST';
import { WBProduct } from '../dto/WBProduct';

@Injectable()
export class ParserLogicService {
  private readonly logger = new Logger(ParserLogicService.name);

  constructor(
    private readonly fetchService: ParserFetchService,
    private readonly dbService: ParserDatabaseService,
  ) { }

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
    const products = await this.getAllProductsNmids();
    for (const nmId of products) {
      try {
        const product = await this.fetchService.fetchProduct(Number(nmId))
        await this.dbService.saveProductToDB(product)
      } catch (err) {
        this.logger.warn(`Ошибка при обработке NMID=${nmId}: ${err.message}`)
      }
    }
  }

  async runCardJson(): Promise<void> {
    this.logger.log('Запуск получения card.json для всех товаров');

    const products = await this.getAllProductsNmids();
    for (const nmid of products) {
      try {
        const cardData = await this.fetchProductCardJson(Number(nmid));

        this.logger.log(`Получен card.json для NMID=${nmid}: ${cardData?.imt_name || 'без имени'}`);

        // await this.dbService.saveCartJson(Number(nmid), cardData);
      } catch (err) {
        this.logger.warn(`Не удалось получить card.json для NMID=${nmid}: ${err.message}`);
      }
    }
  }

  async fetchProductCardJson(nmId: number): Promise<any> {
    const existingUrl = await this.dbService.findCartUrl(nmId);
    if (existingUrl) {
      try {
        // const data = await this.fetchService.fetchJson(existingUrl.url);
        await this.dbService.updateProductImage(nmId, existingUrl.url);
        // return data;
      } catch (error) {
        this.logger.warn(`Failed to fetch from cached URL for nmId=${nmId}: ${error.message}`);
      }
    }
    else {
      const res = await this.fetchService.fetchCard(nmId);

      if (!res) {
        throw new Error(`Failed to fetch card data for nmId=${nmId}`);
      }
      const data = res.data;
      await this.dbService.saveCartUrl(nmId, res.url);
      await this.dbService.updateProductImage(nmId, res.url);

      return data;
    }
  }

  // async getRecommendedForOurProducts() {
  //   this.logger.log('Запуск получения card.json для всех товаров');
  //   for (const nmid of allOurProductsNmidTEST) {
  //     try {
  //       const products = await this.fetchService.fetchRecommended(Number(nmid))
  //       for (const product of products){
  //         this.dbService.saveProductToDB(product)
  //       }
  //     } catch (err) {
  //       this.logger.warn(`Не удалось получить card.json для NMID=${nmid}: ${err.message}`);
  //     }
  //   }
  // }

  async getRecommendedForOurProducts() {
    this.logger.log('Recommended Products');

    const allProducts: WBProduct[] = [];

    for (const nmid of allOurProductsNmid) {
      try {
        const products = await this.fetchService.fetchRecommended(Number(nmid));

        allProducts.push(...products);
      } catch (err) {
        this.logger.warn(`Recommended Products для NMID=${nmid}: ${err.message}`);
      }
    }

    if (allProducts.length > 0) {
      await this.dbService.saveManyProductsToDB(allProducts);
    }
  }

  async getAllProducts() {
    return await this.dbService.getAllProducts();
  }

  async getAllProductsNmids() {
    const products = await this.getAllProducts();
    return products.map(product => product.nmId);
  }
  async getAllProductsWithParams(params) {
    return await this.dbService.getAllProductsWithParams(params);
  }

  deleteAllProducts() {
    return this.dbService.deleteAllProducts()
  }

  getProductsCount() {
    return this.dbService.getProductsCount();
  }
  getCartUrlCount() {
    return this.dbService.getCartUrlCount();
  }


  test() {
    return 'test 123 1';
  }
}
