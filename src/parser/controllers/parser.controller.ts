import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
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


  @Get('runSimilarProducts')
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

  @Post('products')
  async getAllProductsWithParams(@Body() body: {
    isOur?: boolean;
    nmId?: string;
    brand?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    minRating?: string | number;
    minFeedbacks?: string | number;
    skip?: string | number;
    take?: string | number;
  }) {
    const {
      isOur,
      nmId,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minFeedbacks,
      skip,
      take,
    } = body;

    return this.ParserLogicService.getAllProductsWithParams({
      isOur,
      nmId,
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
  @Get('testProxy')
  async testProxy() {
    return this.ParserLogicService.testProxy();
  }
  @Get('deleteOldCartUrls')
  async deleteOldCartUrls() {
    return this.ParserLogicService.deleteOldCartUrls();
  }




  // @Post('product/:ourId/add-competitors')
  // async addCompetitors(
  //   @Param('ourId', ParseIntPipe) ourId: number,
  //   @Query('competitorIds') competitorIdsString: string,
  // ) {
  //   const competitorIds = competitorIdsString
  //     .split(',')
  //     .map(id => parseInt(id.trim()))
  //     .filter(id => !isNaN(id));

  //   return this.ParserLogicService.linkCompetitor(ourId, competitorIds);
  // }


  @Post('product/:ourNmId/add-competitors-by-nmId')
  async addCompetitorsByNmId(
    @Param('ourNmId', ParseIntPipe) ourNmId: number,
    @Body() body: { competitorNmIds: number[] }
  ) {
    return this.ParserLogicService.linkCompetitorByNmId(ourNmId, body.competitorNmIds);
  }

  @Get('product/:ourNmId/competitors') 
  async getCompetitors(@Param('ourNmId', ParseIntPipe) ourNmId: number) {
    return this.ParserLogicService.getCompetitors(ourNmId);
  }

  @Delete('product/:ourNmId/remove-competitors')
  async removeCompetitors(
    @Param('ourNmId', ParseIntPipe) ourNmId: number,
    @Body() body: { competitorNmIds: number[] },
  ) {
    return this.ParserLogicService.unlinkCompetitorsByNmId(ourNmId, body.competitorNmIds);
  }

}
