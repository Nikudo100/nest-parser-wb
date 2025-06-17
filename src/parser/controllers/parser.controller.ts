import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ParserLogicService } from '../services/parser.logic.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly ParserLogicService: ParserLogicService) {}

  @Get('product/:id')
  async getProductCard(@Param('id', ParseIntPipe) id: number) {
    return this.ParserLogicService.getProductByNmId(id);
  }


  @Get('alg1')
  async runAlg1() {
    return this.ParserLogicService.runSimilarProducts();
  }

  // @Get('alg2')
  // async runAlg2() {
  //   return this.ParserLogicService.runSimilarProductsParser();
  // }
  @Get('card')
  async runCardJson() {
    return this.ParserLogicService.runCardJson();
  }



  @Get('test')
  async test() {
    return this.ParserLogicService.test();
  }
}
