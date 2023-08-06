import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { GetMatchingOrdersDto } from './DTO/GetMatchingOrdersDTO';
import { GetOrdersDto } from './DTO/GetOrdersDTO';
import { BlockchainService } from './blockchain/blockchain.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {}

  async onModuleInit() {
    await this.blockchainService.init();
  }

  async onApplicationBootstrap() {
  }

  getMain(): string {
    return 'Главная страница!';
  }

  async getOrders(dto: GetOrdersDto): Promise<Prisma.OrderCreateInput[]> {
    // Объект условий для выборки данных из базы
    const where: Prisma.OrderWhereInput = {};
    if (dto.tokenA) where.tokenA = dto.tokenA;
    if (dto.tokenB) where.tokenB = dto.tokenB;
    if (dto.user) where.creatorAddress = dto.user;
    if (typeof dto.active !== 'undefined') where.isActive = dto.active;

    // Запрос к БД
    const orders = await this.prisma.order.findMany({ where });
    return orders;
  }

  async getMatchingOrders(dto: GetMatchingOrdersDto): Promise<string[]> {
    const { tokenA, tokenB, amountA, amountB, isMarket } = dto;

    const baseParameters = {
      tokenA: { equals: tokenA },
      tokenB: { equals: tokenB },
    };

    let amountParameters;

    if (isMarket || amountA === '0') {
      amountParameters = {
        amountA: { lte: amountA },
        amountB: { gte: amountB },
      };
    } else {
      amountParameters = {
        amountA: { equals: amountA },
        amountB: { equals: amountB },
      };
    }

    const findParameters = { ...baseParameters, ...amountParameters };

    // Запрос к БД
    return this.prisma.order
      .findMany({
        where: findParameters,
        select: {
          id: true,
        },
      })
      .then((orders) => orders.map((order) => order.id));
  }
}
