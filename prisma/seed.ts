import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.order.create({
    data: {
      creatorAddress: '0x1234567890abcdef',
      tokenA: '0x1234567890abcdef',
      tokenB: '0xfedcba0987654321',
      amountA: 100,
      amountB: 200,
      amountLeftToFill: 100,
      isActive: true,
    },
  });

  await prisma.order.create({
    data: {
      creatorAddress: '0xfedcba0987654321',
      tokenA: '0xfedcba0987654321',
      tokenB: '0x1234567890abcdef',
      amountA: 200,
      amountB: 100,
      amountLeftToFill: 200,
      isActive: true,
    },
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
