import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { WBProduct } from '../dto/WBProduct';

import { allOurProductsNmid } from '../storage/allOurProductsNmid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ParserDatabaseService {
  constructor(private prisma: PrismaService) {}

  async saveProductToDB(product: WBProduct): Promise<Product> {
    const savedProduct = await this.saveBasicProductInfo(product);
    await this.processWarehouseAndStockData(savedProduct, product.sizes);
    return savedProduct;
  }

  private async saveBasicProductInfo(product: WBProduct): Promise<Product> {
    const {
      id,
      name,
      brand,
      pics,
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

    // Get main product image URL
    const image = pics && pics.length > 0 
      ? `https://images.wbstatic.net/big/new/${Math.floor(id/10000)}0000/${id}-1.jpg`
      : null;

    const isOurProduct = allOurProductsNmid.includes(id.toString());

    // Save or update product with image
    return await this.prisma.product.upsert({
      where: { nmid: id },
      create: {
        nmid: id,
        name,
        brand,
        image,
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
        image,
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
  }

  private async processWarehouseAndStockData(savedProduct: Product, sizes: WBProduct['sizes']): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
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
          optionId: BigInt(size.optionId.toString()),
          productId: savedProduct.id,
        }))
      );

      if (stockEntries.length) {
        await tx.warehouseStock.createMany({ data: stockEntries });
      }

      await this.saveDailyStockSnapshot(tx, savedProduct.id, stockEntries);
    });
  }

  private async saveDailyStockSnapshot(
    tx: any,
    productId: number,
    stockEntries: Array<{ qty: number }>,
  ): Promise<void> {
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
  }
} 