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
export class ParserDatabaseService {
  constructor(private prisma: PrismaService) { }

  private readonly logger = new Logger(ParserDatabaseService.name);

  public async saveProductToDB(product: WBProduct) {
    try {
      const savedProduct = await this.saveBasicProductInfo(product);
      await this.processWarehouseAndStockData(savedProduct, product.sizes);
      await this.saveDailyStockSnapshot(savedProduct.id, product.totalQuantity);
      return savedProduct.nmId;
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

      const image = null;

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
        isDeleted: false,
        parsedAt: new Date(),
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
    productId: number,
    totalQuantity,
  ): Promise<void> {
    try {
      const totalStock = totalQuantity;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await await this.prisma.dailyStockSnapshot.upsert({
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
  try {
    const nmIdToNum = Number(nmId);
    const camelCaseData = convertKeysToCamelCase(rawData);
    const plainCard = instanceToPlain(camelCaseData);

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { nmId: nmIdToNum }
    });

    if (!product) {
      throw new Error(`Product with nmId ${nmIdToNum} not found`);
    }

    // Prepare data for upsert
    const processedCard = {
      nmId: nmIdToNum,
      imtId: plainCard.imtId ? Number(plainCard.imtId) : null,
      slug: plainCard.slug || null,
      name: plainCard.imtName || null,
      vendorCode: plainCard.vendorCode || null,
      description: plainCard.description || null,
      options: plainCard.options || null,
      groupedOptions: plainCard.groupedOptions || null,
      certificate: plainCard.certificate || null,
      fullColors: plainCard.fullColors || null,
      selling: plainCard.selling || null,
      media: plainCard.media || null,
      data: plainCard.data || null,
      nmColorsNames: plainCard.nmColorsNames || null,
      contents: plainCard.contents || null,
      hasRich: plainCard.hasRich || null,
      parsedAt: new Date()
    };

    // Upsert the product cart data
    await this.prisma.productCart.upsert({
      where: { nmId: nmIdToNum },
      create: processedCard,
      update: processedCard
    });

    this.logger.debug(`Successfully saved cart JSON for nmId: ${nmIdToNum}`);
  } catch (error) {
    this.logger.error(`Failed to save cart JSON for nmId ${nmId}: ${error.message}`, error.stack);
    throw error;
  }
}

  public async saveCartUrl(nmId: number, url: string): Promise<void> {
    try {
      // First check if product exists
      const product = await this.prisma.product.findUnique({
        where: { nmId }
      });

      if (!product) {
        throw new Error(`Product with nmId ${nmId} not found`);
      }

      // Check if cart URL already exists
      const existing = await this.prisma.cartUrl.findUnique({
        where: { nmId }
      });

      // Only create new record if it doesn't exist
      if (!existing) {
        await this.prisma.cartUrl.create({
          data: {
            nmId,
            url,
          }
        });
        this.logger.debug(`Successfully saved new cart URL for nmId: ${nmId}`);
      }

    } catch (error) {
      this.logger.error(`Failed to save cart URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async findCartUrl(nmId: number) {
    try {
      return await this.prisma.cartUrl.findUnique({
        where: { nmId }
      });
    } catch (error) {
      this.logger.error(`Failed to find cart URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async saveManyProductsToDB(products: WBProduct[]): Promise<void> {
    try {
      const productBaseData: Array<{
        nmId: number;
        imtId: number;
        name?: string;
        brand?: string;
        supplier?: string;
        supplierId?: number;
        supplierRating?: number;
        rating?: number;
        reviewRating?: number;
        feedbacks?: number;
        totalQuantity?: number;
        colors?: string;
        is_our_product: boolean;
        image: string | null;
        price: number | null;
        parsedAt: Date;
        isDeleted: false;
      }> = [];

      for (const product of products) {
        const id = Number(product.id);
        const isOurProduct = allOurProductsNmid.includes(id.toString());
        const sizes = product.sizes;

        const price = sizes?.[0]?.price?.total
          ? Math.round(sizes[0].price.total / 100)
          : null;

        const image = null;

        productBaseData.push({
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
          colors: Array.isArray(product.colors) ? JSON.stringify(product.colors) : product.colors,
          is_our_product: isOurProduct,
          image,
          price,
          isDeleted: false,
          parsedAt: new Date(),
        });
      }

      // Разбиваем на батчи по 100
      const chunkArray = <T>(arr: T[], size: number): T[][] =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size)
        );

      const chunks = chunkArray(productBaseData, 100);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const [i, chunk] of chunks.entries()) {
        await this.prisma.$transaction(async (tx) => {
          const upsertedProducts = await Promise.all(
            chunk.map(baseData =>
              tx.product.upsert({
                where: { nmId: baseData.nmId },
                create: baseData,
                update: {
                  ...baseData,
                  parsedAt: new Date(),
                },
              })
            )
          );

          const productIds = upsertedProducts.map(p => p.id);

          await tx.warehouseStock.deleteMany({
            where: {
              productId: { in: productIds },
            },
          });

          await Promise.all(
            upsertedProducts.map(product => {
              const baseData = chunk.find(p => p.nmId === product.nmId);
              if (!baseData) return Promise.resolve();

              return tx.dailyStockSnapshot.upsert({
                where: {
                  productId_date: {
                    productId: product.id,
                    date: today,
                  },
                },
                create: {
                  productId: product.id,
                  date: today,
                  totalStock: baseData.totalQuantity || 0,
                },
                update: {
                  totalStock: baseData.totalQuantity || 0,
                },
              });
            })
          );
        }, {
          timeout: 20_000,
        });

        this.logger.log(`✅ Saved batch ${i + 1}/${chunks.length} (${chunk.length} products)`);
      }

      this.logger.log(`✅ All ${productBaseData.length} products saved in ${chunks.length} batches.`);
    } catch (error) {
      this.logger.error(`❌ Failed to save products in bulk: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async deleteAllProducts(): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {

        // Finally delete all products
        await tx.product.deleteMany({});

        this.logger.log('✅ Successfully deleted all products and related data');
      });
    } catch (error) {
      this.logger.error(`❌ Failed to delete products: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async getProductsCount() {
    try {
      const count = await this.prisma.product.count();
      this.logger.log(`Total products count: ${count}`);
      return { count };
    } catch (error) {
      this.logger.error(`Failed to get products count: ${error.message}`, error.stack);
      throw error;
    }
  }
  public async getCartUrlCount() {
    try {
      const count = await this.prisma.cartUrl.count();
      this.logger.log(`Total cart Url count: ${count}`);
      return { count };
    } catch (error) {
      this.logger.error(`Failed to get cart Url count: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async getAllProducts() {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isDeleted: false
        },
        orderBy: [
          {
            rating: 'desc',
          },
          {
            feedbacks: 'desc',
          },
        ],
      });
      this.logger.debug(`Retrieved ${products.length} products from database`);
      return products;
    } catch (error) {
      this.logger.error(`Failed to get all products: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async getAllProductsWithParams(params: {
    isOur: boolean;
    nmId?: number;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    minFeedbacks?: number;
    skip?: number;
    take?: number;
  }) {
    const {
      isOur,
      nmId,
      brand,
      minPrice = 0,
      maxPrice,
      minRating = 0,
      minFeedbacks = 0,
      skip = 0,
      take = 20,
    } = params;

    try {
      const products = await this.prisma.product.findMany({
        where: {
          ...(nmId ? { nmId: Number(nmId) } : {}),
          ...(isOur ? { is_our_product: Boolean(isOur) } : {}),
          price: {
            gte: minPrice,
            ...(maxPrice ? { lte: maxPrice } : {}),
          },
          isDeleted: false,
          rating: { gte: minRating },
          feedbacks: { gte: minFeedbacks },
          ...(brand ? { brand: { contains: brand, mode: 'insensitive' } } : {}),
        },
        orderBy: [
          { rating: 'desc' },
          { feedbacks: 'desc' },
        ],
        skip,
        take,
      });

      const total = await this.prisma.product.count({
        where: {
          price: { gte: minPrice, ...(maxPrice ? { lte: maxPrice } : {}) },
          rating: { gte: minRating },
          feedbacks: { gte: minFeedbacks },
          ...(brand ? { brand: { contains: brand, mode: 'insensitive' } } : {}),
        },
      });

      return { products, total };
    } catch (error) {
      this.logger.error(`Failed to get products: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async updateProductImage(nmId: number, url: string): Promise<void> {
    try {
      const newImage = url.replace('info/ru/card.json', 'images/big/1.webp')

      await this.prisma.product.update({
        where: { nmId },
        data: {
          image: newImage,
          parsedAt: new Date()
        }
      });

      this.logger.debug(`Successfully updated image for product with nmId: ${nmId}`);
    } catch (error) {
      this.logger.error(`Failed to update product image: ${error.message}`, error.stack);
      throw error;
    }
  }

  public async softDeleteProduct(nmId: number): Promise<void> {
    try {
      await this.prisma.product.update({
        where: { nmId },
        data: { isDeleted: true },
      });
      this.logger.log(`Product ${nmId} marked as deleted.`);
    } catch (error) {
      this.logger.error(`Failed to soft delete product: ${error.message}`, error.stack);
      throw error;
    }
  }


async linkCompetitorByNmId(ourNmId: number, competitorNmIds: number[]) {
    // 1. Find our product by nmId
    const ourProduct = await this.prisma.product.findUnique({
      where: { nmId: ourNmId },
    });

    if (!ourProduct || !ourProduct.is_our_product) {
      throw new Error('Our product not found or not marked as ours.');
    }

    // 2. Find competitor products by nmIds
    const competitors = await this.prisma.product.findMany({
      where: {
        nmId: { in: competitorNmIds },
      },
    });

    if (competitors.length !== competitorNmIds.length) {
      throw new Error('Some competitors not found.');
    }

    if (competitors.some(c => c.is_our_product)) {
      throw new Error('Some competitors are marked as our products.');
    }

    // 3. Check for existing links
    const existingLinks = await this.prisma.productCompetitor.findMany({
      where: {
        ourProduct: { nmId: ourNmId },
        competitor: { nmId: { in: competitorNmIds } },
      },
    });

    if (existingLinks.length > 0) {
      throw new Error('Some competitors are already linked to this product.');
    }

    const competitorLinks = competitorNmIds.map(competitorNmId => ({
      ourProductNmId: ourProduct.nmId,
      competitorNmId
    }));
    
    return this.prisma.productCompetitor.createMany({
      data: competitorLinks
    });
  }

  async getCompetitors(ourNmId: number) {
    const competitors = await this.prisma.productCompetitor.findMany({
      where: {
        ourProduct: { nmId: ourNmId }
      },
      include: {
        competitor: true,
        ourProduct: true,
      },
    });

    if (competitors.length === 0) {
      return null;
    }

    const ourProduct = competitors[0].ourProduct;
    const competitorList = competitors.map(c => c.competitor);

    return {
      ourProduct,
      competitors: competitorList,
    };
  }

  async unlinkCompetitorsByNmId(ourNmId: number, competitorNmIds: number[]) {
    // Find our product by nmId
    const ourProduct = await this.prisma.product.findUnique({
      where: { nmId: ourNmId },
    });

    if (!ourProduct || !ourProduct.is_our_product) {
      throw new Error('Our product not found or not marked as ours.');
    }

    // Delete links directly using nmIds
    return this.prisma.productCompetitor.deleteMany({
      where: {
        ourProduct: { nmId: ourNmId },
        competitor: { nmId: { in: competitorNmIds } }
      },
    });
  }


async deleteOldCartUrls(): Promise<void> {
  try {
    const result = await this.prisma.cartUrl.deleteMany({
      where: {
        url: {
          contains: 'https://basket-01.wbbasket.ru/'
        }
      }
    });
    
    this.logger.log(`Successfully deleted ${result.count} old cart URLs`);
  } catch (error) {
    this.logger.error(`Failed to delete old cart URLs: ${error.message}`, error.stack);
    throw error;
  }
}
}