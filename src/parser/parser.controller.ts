import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller('parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  // @Get(':id')
  // async getProduct(@Param('id', ParseIntPipe) id: number) {
  //   return this.parserService.getProductInfo(id);
  // }

  @Get('save/:id')
  async saveAllJson(@Param('id', ParseIntPipe) id: number) {
    await this.parserService.fetchAndSaveAllJson(id);
    return { status: 'ok', id };
  }


  
  @Get('parse')
  async parse(@Query('url') url: string) {
    return this.parserService.parseProduct(url);
  }

  @Get('product/:id')
  async getProductCard(@Param('id', ParseIntPipe) id: number) {
    return this.parserService.getProductCard(id);
  }
  @Get('test')
  async test() {
    return this.parserService.test();
  }
}
