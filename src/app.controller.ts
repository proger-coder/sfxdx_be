import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Prisma } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMain(): string {
    return this.appService.getMain();
  }

  /**
   * Возвращает массив заявок.
   * Параметры опциональны. Без параметров вернет все ордера.
   * С заданным tokenA\tokenB - все заявки где в паре есть tokenA и|или tokenB.
   * С параметром user - все заявки от конкретного пользователя.
   * Параметр active (по умолчанию false) задает выдачу только не закрытых заявок.
   *
   * @param {string} [tokenA] - Адрес токена A (опционально)
   * @param {string} [tokenB] - Адрес токена B (опционально)
   * @param {string} [user] - Адрес пользователя (опционально)
   * @param {boolean} [active=false] - Показывать только активные ордера (опционально)
   * @return {Promise<Prisma.OrderUncheckedCreateInput[]>} - Промис с массивом ордеров (заявок)
   *
   * @Get('getOrders')
   */
  @Get('getOrders')
  getOrders(
    @Query('tokenA') tokenA?: string,
    @Query('tokenB') tokenB?: string,
    @Query('user') user?: string,
    @Query('active') active?: boolean,
  ): Promise<Prisma.OrderUncheckedCreateInput[]> {
    console.log(tokenA, tokenB, user, active);
    return this.appService.getOrders({ tokenA, tokenB, user, active });
  }

  /**
   * Возвращает массив идентификаторов заявок для вызова метода matchOrders в смарт-контракте.
   * Если параметр isMarket не задан или false, то функция возвращает ордера,
   * которые точно совпадают с заданными amountA и amountB (лимитные ордера).
   * Если isMarket true, функция возвращает ордера,
   * в которых amountA не превышает указанный и amountB не меньше указанного (рыночные ордера).
   * Если amountA равно нулю, то ордера также считаются по рынку.
   *
   * @param {string} tokenA - Адрес токена покупки
   * @param {string} tokenB - Адрес токена продажи
   * @param {string} amountA - Сумма покупки (если = 0, то считаем по рынку)
   * @param {string} amountB - Сумма продажи
   * @param {boolean} isMarket - Показывать только рыночные ордера
   * @return {Promise<string[]>} - Промис с массивом идентификаторов ордеров (заявок)
   *
   * @Get('getMatchingOrders')
   */
  @Get('getMatchingOrders')
  getMatchingOrders(
    @Query('tokenA') tokenA: string,
    @Query('tokenB') tokenB: string,
    @Query('amountA') amountA: string,
    @Query('amountB') amountB: string,
    @Query('isMarket') isMarket: boolean,
  ): Promise<string[]> {
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
