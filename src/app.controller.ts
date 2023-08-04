import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMain(): string {
    return this.appService.getMain();
  }
  @Get('getOrders')
  getOrders(
    @Query('tokenA') tokenA?: string,
    @Query('tokenB') tokenB?: string,
    @Query('user') user?: string,
    @Query('active') active = false,
  ): string {
    console.log(tokenA, tokenB, user, active);
    return this.appService.getOrders({ tokenA, tokenB, user, active });
  }

  @Get('getMatchingOrders')
  getMatchingOrders(
    @Query('tokenA') tokenA?: string,
    @Query('tokenB') tokenB?: string,
    @Query('amountA') amountA?: string,
    @Query('amountB') amountB?: string,
    @Query('isMarket') isMarket?: boolean,
  ): string {
    console.log(tokenA, tokenB, amountA, amountB);
    return this.appService.getMatchingOrders({
      tokenA,
      tokenB,
      amountA,
      amountB,
      isMarket,
    });
  }
}
