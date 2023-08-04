import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getMain(): string {
    return 'Main page!';
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
    if (params.active !== undefined) where.isActive = !!params.active;

    // Выполните запрос к базе данных
    const orders = await this.prisma.order.findMany({ where });
    return orders;
  }

  async getMatchingOrders({
    tokenA,
    tokenB,
    amountA,
    amountB,
    isMarket,
  }: {
    tokenA: string;
    tokenB: string;
    amountA: string;
    amountB: string;
    isMarket: boolean;
  }): Promise<Prisma.OrderUncheckedCreateInput[]> {
    let findParameters;

    // Если amountA равен 0, то заявка будет исполнена по рынку, независимо от флага isMarket.
    if (isMarket || amountA === '0') {
      findParameters = {
        tokenA: { equals: tokenA },
        tokenB: { equals: tokenB },
        isActive: { equals: true },
        amountA: { lte: amountA },
        amountB: { gte: amountB },
      };
    } else {
      findParameters = {
        tokenA: { equals: tokenA },
        tokenB: { equals: tokenB },
        isActive: { equals: true },
        amountA: { equals: amountA },
        amountB: { equals: amountB },
      };
    }

    return this.prisma.order.findMany({
      where: findParameters,
    });
  }
}
