import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Prisma } from '@prisma/client';
import { GetOrdersDto } from './DTO/GetOrdersDTO';
import { GetMatchingOrdersDto } from './DTO/GetMatchingOrdersDTO';
import { BlockchainService } from './blockchain/blockchain.service';
import { CreateOrderDto } from './DTO/CreateOrderDTO';
import { MatchOrdersDto } from './DTO/MatchOrdersDTO';
import { promises as fs } from 'fs';
import { marked } from 'marked';
import { ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiTags } from '@nestjs/swagger';
import { CancelOrderDto } from "./DTO/CancelOrderDTO";

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get README content' })
  @ApiResponse({ status: 200, description: 'Returns the rendered markdown from README.md' })
  async getReadme(): Promise<string> {
    const readmeContent = await fs.readFile('README.md', 'utf-8');
    return marked(readmeContent);
    //return await fs.readFile('README.md', 'utf-8');
  }

  /**
   * Возвращает массив заявок.
   * Параметры опциональны. Без параметров вернет все ордера.
   * С заданным tokenA\tokenB - все заявки где в паре есть tokenA и|или tokenB.
   * С параметром user - все заявки от конкретного пользователя.
   * Параметр active (по умолчанию false) задает выдачу только не закрытых заявок.
   *
   * @return {Promise<Prisma.OrderCreateInput[]>} - Промис с массивом ордеров (заявок)
   *
   * @Get('getOrders')
   * @param getOrdersDto
   */

  @Get('getOrders')
  @ApiOperation({ summary: 'Retrieve a list of orders' })
  @ApiResponse({ status: 200, description: 'Returns a list of orders' })
  getOrders(
    @Query() getOrdersDto: GetOrdersDto, // Использование DTO
  ): Promise<Prisma.OrderCreateInput[]> {
    console.log(getOrdersDto);
    return this.appService.getOrders(getOrdersDto);
  }

  /**
   * Возвращает массив идентификаторов заявок для вызова метода matchOrders в смарт-контракте.
   * Если параметр isMarket не задан или false, то функция возвращает ордера,
   * которые точно совпадают с заданными amountA и amountB (лимитные ордера).
   * Если isMarket true, функция возвращает ордера,
   * в которых amountA не превышает указанный и amountB не меньше указанного (рыночные ордера).
   * Если amountA равно нулю, то ордера также считаются по рынку.
   *
   * @return {Promise<string[]>} - Промис с массивом идентификаторов ордеров (заявок)
   *
   * @Get('getMatchingOrders')
   * @param getMatchingOrdersDto
   */

  @Get('getMatchingOrders')
  @ApiOperation({ summary: 'Retrieve matching orders based on criteria' })
  @ApiResponse({ status: 200, description: 'Returns a list of matching order IDs' })
  getMatchingOrders(
    @Query() getMatchingOrdersDto: GetMatchingOrdersDto, // Использование DTO
  ): Promise<string[]> {
    console.log(getMatchingOrdersDto);
    return this.appService.getMatchingOrders(getMatchingOrdersDto);
  }

  /**
   * 5 токенов перечислены в .env
   * */
  @Post('createOrder')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiBody({ type: CreateOrderDto })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const { tokenA, tokenB, amountA, amountB } = createOrderDto;
    return await this.blockchainService.createOrder(
      tokenA,
      tokenB,
      +amountA,
      +amountB,
    );
  }

  @Post('matchOrders')
  @ApiOperation({ summary: 'Match given orders' })
  @ApiResponse({ status: 200, description: 'Orders matched successfully' })
  @ApiBody({ type: MatchOrdersDto })
  async matchOrders(@Body() matchOrders: MatchOrdersDto) {
    const { matchedOrderIds, tokenA, tokenB, amountA, amountB, isMarket } =
      matchOrders;
    return await this.blockchainService.matchOrders(
      matchedOrderIds,
      tokenA,
      tokenB,
      +amountA,
      +amountB,
      isMarket,
    );
  }

  @Post('cancelOrder')
  @ApiOperation({ summary: 'Cancel a specific order' })
  @ApiResponse({ status: 200, description: 'Order canceled successfully' })
  @ApiBody({ type: CancelOrderDto })
  async cancelOrder(@Body() cancelOrderDto: CancelOrderDto) {
    return await this.blockchainService.cancelOrder(cancelOrderDto.id);
  }
}
