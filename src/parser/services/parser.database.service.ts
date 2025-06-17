import { Injectable, Logger } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Product } from '@prisma/client';
import { WBProduct } from '../dto/WBProduct';

import { allOurProductsNmid } from '../storage/allOurProductsNmid';
import { PrismaService } from 'src/prisma/prisma.service';
import { convertKeysToCamelCase } from '../helpers/parser.main.helpers';
// import { ProductCardDto } from '../dto/ProductCard';

@Injectable()
export class ParserDatabaseService 
{
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(ParserDatabaseService.name);

  public async saveProductToDB(product: WBProduct): Promise<Product> {
    try {
      const savedProduct = await this.saveBasicProductInfo(product);
      await this.processWarehouseAndStockData(savedProduct, product.sizes);
      return savedProduct;
    } catch (error) {
      this.logger.error(`Failed to save product to DB: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async saveBasicProductInfo(product: WBProduct): Promise<Product> {
    try {
      const id = Number(product.id);
      const isOurProduct = allOurProductsNmid.includes(id.toString());

      const sizes = product.sizes;
      const price = sizes?.[0]?.price?.total
        ? Math.round(sizes[0].price.total / 100)
        : null;

      const image =
        product.pics && product.pics.length > 0
          ? `https://images.wbstatic.net/big/new/${Math.floor(id / 10000)}0000/${id}-1.jpg`
          : null;

      const baseData = {
        nmId: id,
        imtId: Number(product.root),
        name: product.name,
        brand: product.brand,
        supplier: product.supplier,
        supplierId: product.supplierId,
        supplierRating: product.supplierRating,
        rating: product.rating,
        reviewRating: product.reviewRating,
        feedbacks: product.feedbacks,
        totalQuantity: product.totalQuantity,
        colors: product.colors,
        is_our_product: isOurProduct,
        image,
        price,
      };

      const result = await this.prisma.product.upsert({
        where: { nmId: id },
        create: {
          ...baseData,
        },
        update: {
          ...baseData,
          parsedAt: new Date(),
        },
      });

      this.logger.debug(`Successfully saved basic product info for nmId: ${id}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to save basic product info: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processWarehouseAndStockData(savedProduct: Product, sizes: WBProduct['sizes']): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        try {
          // Clean old warehouse stocks
          await tx.warehouseStock.deleteMany({
            where: { productId: savedProduct.id },
          });

          // Prepare and save new warehouse stocks
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
              optionId: Number(size.optionId),
              productId: savedProduct.id,
            }))
          );

          if (stockEntries.length) {
            await tx.warehouseStock.createMany({ data: stockEntries });
            this.logger.debug(`Created ${stockEntries.length} warehouse stock entries for product ${savedProduct.id}`);
          }

          await this.saveDailyStockSnapshot(tx, savedProduct.id, stockEntries);
        } catch (error) {
          this.logger.error(`Transaction failed: ${error.message}`, error.stack);
          throw error;
        }
      });
    } catch (error) {
      this.logger.error(`Failed to process warehouse and stock data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async saveDailyStockSnapshot(
    tx: any,
    productId: number,
    stockEntries: Array<{ qty: number }>,
  ): Promise<void> {
    try {
      const totalStock = stockEntries.reduce((sum, entry) => sum + entry.qty, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await tx.dailyStockSnapshot.upsert({
        where: {
          productId_date: {
            productId: productId,
            date: today,
          },
        },
        create: {
          productId: productId,
          date: today,
          totalStock,
        },
        update: {
          totalStock,
        },
      });

      this.logger.debug(`Saved daily stock snapshot for product ${productId} with total stock: ${totalStock}`);
    } catch (error) {
      this.logger.error(`Failed to save daily stock snapshot: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async saveCartJson(nmId: number, rawData: any): Promise<void> {
    const nmIdToNum = Number(nmId);
  
    const camelCaseData = convertKeysToCamelCase(rawData);
    const plainCard = instanceToPlain(camelCaseData);
    const parsedAt = new Date();
  
    // Проверим наличие Product с таким nmId
    const product = await this.prisma.product.findUnique({
      where: { nmId: nmIdToNum }
    });
  
    if (!product) {
      throw new Error(`Product with nmId ${nmIdToNum} not found`);
    }
  
    // Готовим данные для вставки
    const processedCard = {
      nmId: nmIdToNum,
      imtId: plainCard.imtId ? Number(plainCard.imtId) : undefined,
    };
  
    // upsert с корректным синтаксисом
    await this.prisma.productCart.upsert({
      where: { nmId: nmIdToNum },
      create: processedCard,
      update: processedCard
    });
  }


}