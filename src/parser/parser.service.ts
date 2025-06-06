import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);
  private readonly storagePath = path.resolve(__dirname, 'storage');

  constructor(private readonly httpService: HttpService) {
    this.ensureStorageDir();
  }

  private ensureStorageDir() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async getCardData(productId: number) {
    const url = `https://card.wb.ru/cards/v1/detail?nm=${productId}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const product = response.data?.data?.products?.[0];
      if (!product) {
        this.logger.warn(`card.json не содержит товар ${productId}`);
        return null;
      }
      return {
        fullCardJson: response.data,
        product,
      };
    } catch (error) {
      this.logger.error(`Ошибка при получении card.json для ${productId}: ${error.message}`);
      return null;
    }
  }

  async getDetailData(productId: number) {
    const idStr = productId.toString().padStart(10, '0');
    const vol = idStr.slice(0, 3);
    const part = idStr.slice(3, 5);
    const url = `https://basket-${vol}.wb.ru/vol${vol}/part${part}/${idStr}/detail.json`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Ошибка при получении detail.json для ${productId}: ${error.message}`);
      return null;
    }
  }

  async fetchAndSaveAllJson(productId: number) {
    const cardResult = await this.getCardData(productId);
    const detailJson = await this.getDetailData(productId);

    if (!cardResult) {
      this.logger.warn(`Не удалось получить card.json для ${productId}`);
      return;
    }

    const fullData = {
      productId,
      card: cardResult.fullCardJson,
      detail: detailJson,
    };

    const filePath = path.join(this.storagePath, `${productId}.json`);

    fs.writeFileSync(filePath, JSON.stringify(fullData, null, 2), 'utf-8');
    this.logger.log(`JSON успешно сохранён: ${filePath}`);
    console.log(fullData);
  }



  async parseProduct(url: string) {
    try {
      // 1. Получаем HTML страницы
      const { data: html } = await axios.get(url, {
        headers: {
          // Нужно установить user-agent, чтобы сервер не блокировал
          'User-Agent': 'Mozilla/5.0 (compatible; NestJS bot)',
        },
      });

      // 2. Загружаем HTML в cheerio
      const $ = cheerio.load(html);

      // 3. Выделяем нужные данные (пример)
      const productName = $('h1.product-title').text().trim();
      const price = $('.price-block__final-price').text().trim();
      const description = $('.product-description').text().trim();

      // Возвращаем объект с данными
      return {
        productName,
        price,
        description,
      };
    } catch (error) {
      throw new HttpException('Ошибка парсинга страницы', HttpStatus.BAD_REQUEST);
    }
  }
  async getProductCard(nmId: number) {
    const url = `https://card.wb.ru/cards/detail?appType=1&curr=rub&dest=-1257786&nm=${nmId}`;
    // const url = `https://card.wb.ru/cards/detail?appType=1&curr=rub&dest=-1257786&spp=30&nm=${nmId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (NestJS Parser)',
        },
      });

      const productData = response.data;

      if (!productData) {
        throw new Error('Товар не найден');
      }

      return productData
    //   {
    //     id: productData.id,
    //     brand: productData.brand,
    //     name: productData.name,
    //     priceU: productData.priceU / 100,
    //     salePriceU: productData.salePriceU / 100,
    //     rating: productData.rating,
    //     feedbacks: productData.feedbacks,
    //     colors: productData.colors,
    //   };
    } catch (error) {
      throw new Error(`Ошибка при получении товара: ${error.message}`);
    }
  }

    test() {
    return 'test';
  }
}
