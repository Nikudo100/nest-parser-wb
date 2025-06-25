import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ParserLogicService } from '../services/parser.logic.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly ParserLogicService: ParserLogicService) { }

  @Get('product/:id')
  async getProductCard(@Param('id', ParseIntPipe) id: number) {
    return this.ParserLogicService.getProductByNmId(id);
  }


  // @Get('alg1')
  // async runAlg1() {
  //   return this.ParserLogicService.runSimilarProducts();
  // }
  @Get('alg2')
  async runAlg2() {
    return this.ParserLogicService.runSimilarProducts();
  }

  @Get('recommended')
  async recommended() {
    return this.ParserLogicService.getRecommendedForOurProducts();
  }

  @Get('cards')
  async runCardJson() {
    return this.ParserLogicService.runCardJson();
  }



  @Get('products1')
  async getAllProducts() {
    return this.ParserLogicService.getAllProducts();
  }

  @Get('products')
  async getAllProductsWithParams(@Query() query) {
    const {
      brand,
      minPrice,
      maxPrice,
      minRating,
      minFeedbacks,
      skip,
      take,
    } = query;

    return this.ParserLogicService.getAllProductsWithParams({
      brand,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      minFeedbacks: minFeedbacks ? Number(minFeedbacks) : undefined,
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 20,
    });
  }

  @Get('products/count')
  async getProductsCount() {
    return this.ParserLogicService.getProductsCount();
  }
  @Get('cartUrls/count')
  async getCartUrlCount() {
    return this.ParserLogicService.getCartUrlCount();
  }
  @Get('dropAll')
  async dropAll() {
    return this.ParserLogicService.deleteAllProducts();
  }

  @Get('product/softDelete/:id')
  async softDeleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.ParserLogicService.softDeleteProduct(id);
  }

  @Get('test')
  async test() {
    return this.ParserLogicService.test();
  }
}
