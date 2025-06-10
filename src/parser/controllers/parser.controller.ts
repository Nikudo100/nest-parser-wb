import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ParserLogicService } from '../services/parser.logic.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly ParserLogicService: ParserLogicService) {}

  // @Get('product/:id')
  // async getProductCard(@Param('id', ParseIntPipe) id: number) {
  //   return this.ParserLogicService.processProductCard(id);
  // }


  @Get('alg1')
  async runAlg1() {
    return this.ParserLogicService.runSimilarProductsParser();
  }

  @Get('alg2')
  async runAlg2() {
    return this.ParserLogicService.runSimilarProductsParser();
  }

  @Get('test')
  async test() {
    return this.ParserLogicService.test();
  }
}
