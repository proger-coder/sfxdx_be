import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.order.createMany({
    data: [
      {
        id: '39508933912070214682909586779800242959841855739851230506147042247837284374228',
        creatorAddress: '0x22961f4eb722b9582e9743a662e6f1c051add4df',
        tokenA: '0x9d2d94cdd59cb1b7c2bf4b9e9863fc9767d19b58',
        tokenB: '0x06db97fa607b1e1adf69fa3b2745f54967d9a09d',
        amountA: `1`,
        amountB: `2`,
        // amountLeftToFill: 1.0, // Если вы хотите инициализировать это значение, но это опционально из-за директивы @default
        // isActive: true, // Опционально из-за директивы @default
        // createdAt: new Date(), // Опционально из-за директивы @default
        orderType: 'LIMIT',
        orderSide: 'BUY',
        // filled: 0, // Опционально из-за директивы @default
        // orderStatus: 'ACTIVE', // Опционально из-за директивы @default
        executionPrice: 4000.0, // Цена исполнения совпадает с amountB / amountA
        fee: 10.0, // Пример комиссии за сделку
        // cancelable: true // Опционально из-за директивы @default
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
