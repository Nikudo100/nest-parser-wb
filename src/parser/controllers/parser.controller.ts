import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ParserLogicService } from '../services/parser.logic.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly ParserLogicService: ParserLogicService) {}

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



  @Get('products')
  async getAllProducts() {
    return this.ParserLogicService.getAllProducts();
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
  @Get('test')
  async test() {
    return this.ParserLogicService.test();
  }
}
