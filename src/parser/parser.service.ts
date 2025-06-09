import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { WBProduct } from './dto/WBProduct';
import { Product } from '@prisma/client';


@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);
  private readonly storagePath = path.resolve(__dirname, 'storage');
  prisma: any;

  constructor(private readonly httpService: HttpService) {}

  async fetchProductCard(nmId: number): Promise<WBProduct> {
    const url = `https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&spp=30&hide_dtype=13&ab_testing=true&lang=ru&nm=${nmId}`;

    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const product = response.data?.data?.products?.[0];

      if (!product) {
        throw new Error('Товар не найден');
      }

      return product;
    } catch (error) {
      throw new Error(`Ошибка при получении товара: ${error.message}`);
    }
  }

  async saveProductToDB(product: WBProduct, isOurProduct = false): Promise<Product> {
    const {
      id,
      name,
      brand,
      supplier,
      supplierId,
      supplierRating,
      rating,
      reviewRating,
      feedbacks,
      totalQuantity,
      colors,
      sizes,
    } = product;

    const price = sizes?.[0]?.price?.total
      ? Math.round(sizes[0].price.total / 100)
      : null;

    const savedProduct = await this.prisma.product.upsert({
      where: { nmid: id },
      create: {
        nmid: id,
        name,
        brand,
        supplier,
        supplierId,
        supplierRating,
        rating,
        reviewRating,
        feedbacks,
        totalQuantity,
        price,
        colors,
        is_our_product: isOurProduct,
      },
      update: {
        name,
        brand,
        supplier,
        supplierId,
        supplierRating,
        rating,
        reviewRating,
        feedbacks,
        totalQuantity,
        price,
        colors,
        is_our_product: isOurProduct,
        parsedAt: new Date(),
      },
    });
  
    // Очистка старых остатков
    await this.prisma.warehouseStock.deleteMany({
      where: { productId: savedProduct.id },
    });
  
    // Новые остатки
    const stockEntries = sizes.flatMap((size) =>
      size.stocks.map((stock) => ({
        wh: stock.wh,
        dtype: stock.dtype,
        dist: stock.dist,
        qty: stock.qty,
        priority: stock.priority,
        time1: stock.time1,
        time2: stock.time2,
        sizeName: size.name || '',
        sizeRank: size.rank,
        optionId: BigInt(size.optionId),
        productId: savedProduct.id,
      }))
    );

    if (stockEntries.length) {
      await this.prisma.warehouseStock.createMany({ data: stockEntries });
    }

    return savedProduct;
  }

  async processProductCard(nmId: number, isOurProduct = false) {
    const product = await this.fetchProductCard(nmId);
    return this.saveProductToDB(product, isOurProduct);
  }

  async getProductCard(nmId: number) {
    const url = `https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&dest=-1257786&spp=30&hide_dtype=13&ab_testing=true&lang=ru&nm=${nmId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
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
    return 'test 123 1';
  }
}
