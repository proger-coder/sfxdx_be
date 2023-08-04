import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {
  }

  getMain(): string {
    return 'Main page!';
  }

  getOrders({ tokenA, tokenB, user, active }): string {
    return `${tokenA} ${tokenB} ${user} ${active}`;
  }

  getMatchingOrders({ tokenA, tokenB, amountA, amountB, isMarket }): string {
    return `${tokenA} ${tokenB} ${amountA} ${amountB} ${isMarket}`;
  }
}
