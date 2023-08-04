import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.order.createMany({
    data: [
      {
        id: 'af4dd4e7-8d98-4f68-af5f-917c34e5e967',
        creatorAddress: '0x1234567890abcdef',
        tokenA: '0x1234567890abcdef',
        tokenB: '0xfedcba0987654321',
        amountA: 100, // Пользователь хочет продать 100 единиц tokenA
        amountB: 200, // Ожидается получить 200 единиц tokenB
        amountLeftToFill: 100, // Ещё не продано ни одной единицы tokenA
        isActive: true,
        orderType: 'LIMIT',
        orderSide: 'SELL',
        filled: 0, // Ничего ещё не продано
      },
      {
        id: '374c8318-6897-4e39-8521-25f3e6d451b3',
        creatorAddress: '0xfedcba0987654321',
        tokenA: '0xfedcba0987654321',
        tokenB: '0x1234567890abcdef',
        amountA: 200, // Пользователь хочет купить 200 единиц tokenA
        amountB: 100, // Готов потратить 100 единиц tokenB
        amountLeftToFill: 200, // Ещё не куплено ни одной единицы tokenA
        isActive: true,
        orderType: 'LIMIT',
        orderSide: 'BUY',
        filled: 0, // Ничего ещё не куплено
      },
      {
        id: 'dce671ec-c2e2-4c8a-8b4e-6e314d4a2610',
        creatorAddress: '0xabcdef1234567890',
        tokenA: '0x1234567890abcdef',
        tokenB: '0xfedcba0987654321',
        amountA: 100, // Пользователь хочет продать 100 единиц tokenA
        amountB: 200, // Ожидается получить 200 единиц tokenB
        amountLeftToFill: 50, // Осталось продать ещё 50 единиц tokenA
        isActive: true,
        orderType: 'MARKET',
        orderSide: 'SELL',
        filled: 50, // Уже продано 50 единиц tokenA
      },
      {
        id: '2c70e2f1-891d-4033-8f31-3b4f7641cabc',
        creatorAddress: '0xabcdef1234567890',
        tokenA: '0x1234567890abcdef',
        tokenB: '0xfedcba0987654321',
        amountA: 200, // Пользователь хочет продать 200 единиц tokenA
        amountB: 200, // Ожидается получить 200 единиц tokenB
        amountLeftToFill: 50, // Осталось продать ещё 50 единиц tokenA
        isActive: true,
        orderType: 'MARKET',
        orderSide: 'SELL',
        filled: 150, // Уже продано 150 единиц tokenA
      },
      {
        id: 'e42c6925-5c75-4c8b-883b-7a9ed0e2d255',
        creatorAddress: '0xabcdef1234567890',
        tokenA: '0x1234567890abcdef',
        tokenB: '0xfedcba0987654321',
        amountA: 100, // Пользователь хотел продать 100 единиц tokenA
        amountB: 200, // Ожидал получить 200 единиц tokenB
        amountLeftToFill: 0, // Все tokenA проданы
        isActive: false,
        orderType: 'LIMIT',
        orderSide: 'SELL',
        filled: 100, // Проданы все 100 единиц tokenA
      },
      {
        id: 'c7335f6e-2e9e-4f09-b1db-81c90a68d2a1',
        creatorAddress: '0xfedcba0987654321',
        tokenA: '0xfedcba0987654321',
        tokenB: '0x1234567890abcdef',
        amountA: 200, // Пользователь хотел купить 200 единиц tokenA
        amountB: 100, // Готов был потратить 100 единиц tokenB
        amountLeftToFill: 0, // Все tokenA куплены
        isActive: false,
        orderType: 'MARKET',
        orderSide: 'BUY',
        filled: 200, // Куплены все 200 единиц tokenA
      },
      {
        id: 'aabf1f0b-91b8-4b57-9356-4a57c0f6a6e1',
        creatorAddress: '0xabcdef1234567890',
        tokenA: '0x1234567890abcdef',
        tokenB: '0xfedcba0987654321',
        amountA: 150, // Пользователь хотел купить 150 единиц tokenA
        amountB: 300, // Готов был потратить 300 единиц tokenB
        amountLeftToFill: 150, // Ордер был отменен до исполнения
        isActive: false,
        orderType: 'LIMIT',
        orderSide: 'BUY',
        filled: 0, // Ничего не куплено
      },
      {
        id: '5b12ae16-8a0a-484c-9f4f-8a9e39a7e1c9',
        creatorAddress: '0xfedcba0987654321',
        tokenA: '0xfedcba0987654321',
        tokenB: '0x1234567890abcdef',
        amountA: 150, // Пользователь хотел продать 150 единиц tokenA
        amountB: 300, // Ожидал получить 300 единиц tokenB
        amountLeftToFill: 150, // Ордер был отменен до исполнения
        isActive: false,
        orderType: 'MARKET',
        orderSide: 'SELL',
        filled: 0, // Ничего не продано
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
