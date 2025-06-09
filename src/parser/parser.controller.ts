import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Get('product/:id')
  async getProductCard(@Param('id', ParseIntPipe) id: number) {
    return this.parserService.getProductCard(id);
  }

  @Get('test')
  async test() {
    return this.parserService.test();
  }
}
