import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getMain(): string {
    return 'Главная страница!';
  }

  async getOrders(params: {
    tokenA?: string;
    tokenB?: string;
    user?: string;
    active?: boolean;
  }): Promise<Prisma.OrderUncheckedCreateInput[]> {
    // Создайте объект, который будет содержать условия для выборки данных из базы
    const where: Prisma.OrderWhereInput = {};
    if (params.tokenA) where.tokenA = params.tokenA;
    if (params.tokenB) where.tokenB = params.tokenB;
    if (params.user) where.creatorAddress = params.user;
    if (typeof params.active !== 'undefined') where.isActive = params.active;

    // Выполните запрос к базе данных
    const orders = await this.prisma.order.findMany({ where });
    return orders;
  }

  async getMatchingOrders({
    tokenA,
    tokenB,
    amountA,
    amountB,
    isMarket = false,
  }: {
    tokenA: string;
    tokenB: string;
    amountA: string;
    amountB: string;
    isMarket: boolean;
  }): Promise<string[]> {
    const baseParameters = {
      tokenA: { equals: tokenA },
      tokenB: { equals: tokenB },
      isActive: { equals: true },
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

    return this.prisma.order.findMany({
        where: findParameters,
        select: {
          id: true,
        },
      })
      .then((orders) => orders.map((order) => order.id));
  }
}
