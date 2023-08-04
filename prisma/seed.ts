import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.order.createMany({
    data: [
      {
        // Активный лимитный ордер на продажу, еще не совпавший ни с одним другим ордером
        id: '3ba24ddd-b2be-4e7f-a214-66c39d6f9898',
        creatorAddress: '0x1234567891234567891234567891234567891234',
        tokenA: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        amountA: 100,
        amountB: 2,
        amountLeftToFill: 100,
        isActive: true,
        orderType: 'LIMIT',
        orderSide: 'SELL',
        filled: 0,
        executionPrice: 0.02,
        fee: 0.1,
        orderStatus: 'ACTIVE',
      },
      {
        // Активный маркетный ордер на покупку, совпавший с другими ордерами на 50%
        id: 'faa77f5a-a5a5-4c4a-8a8a-a1a1d1d1d1d1',
        creatorAddress: '0x9876543219876543219876543219876543219876',
        tokenA: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        amountA: 200,
        amountB: 4,
        amountLeftToFill: 100,
        isActive: true,
        orderType: 'MARKET',
        orderSide: 'BUY',
        filled: 100,
        executionPrice: null,
        fee: 0.2,
        orderStatus: 'PARTIALLY_FILLED',
      },
      {
        // Заполненный лимитный ордер на покупку
        id: 'bbbb1111-cccc-2222-dddd-3333eeee4444',
        creatorAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        tokenA: '0x1f9840a85d5AF5bf1D1762F925BDADdC4201F984', // UNI
        tokenB: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        amountA: 300,
        amountB: 6,
        amountLeftToFill: 0,
        isActive: false,
        orderType: 'LIMIT',
        orderSide: 'BUY',
        filled: 300,
        executionPrice: 0.02,
        fee: 0.3,
        orderStatus: 'FILLED',
      },
      {
        // Активный лимитный ордер на продажу, который уже был частично выполнен (на 10%)
        id: 'e53c8f16-ba47-4075-b4a9-1b38e65424d3',
        creatorAddress: '0x7f6d3ac572051f98f0634b5ea6ac222eedc87953',
        tokenA: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        tokenB: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
        amountA: 500,
        amountB: 510,
        amountLeftToFill: 450,
        isActive: true,
        orderType: 'LIMIT',
        orderSide: 'SELL',
        filled: 50,
        executionPrice: 1.02,
        fee: 0.05,
        orderStatus: 'PARTIALLY_FILLED',
      },
      {
        // Активный маркетный ордер на покупку, еще не совпавший ни с одним другим ордером
        id: 'a491a5b5-c771-4468-8a76-6465e6748a60',
        creatorAddress: '0xe579156f9decc4134b5e3a30a24ac46bb8b01281',
        tokenA: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
        tokenB: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // UNI
        amountA: 3,
        amountB: 100,
        amountLeftToFill: 3,
        isActive: true,
        orderType: 'MARKET',
        orderSide: 'BUY',
        filled: 0,
        executionPrice: null,
        fee: 0.01,
        orderStatus: 'ACTIVE',
      },
      {
        // Заполненный маркетный ордер на продажу
        id: 'c88f5dee-44e3-4b63-bce6-2e5bf9d5036b',
        creatorAddress: '0x986ee2b944c42d017f52af21c4c69b84dbea35d8',
        tokenA: '0x7f6d3ac572051f98f0634b5ea6ac222eedc87953', // USDC
        tokenB: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
        amountA: 1000,
        amountB: 2,
        amountLeftToFill: 0,
        isActive: false,
        orderType: 'MARKET',
        orderSide: 'SELL',
        filled: 1000,
        executionPrice: null,
        fee: 0.2,
        orderStatus: 'FILLED',
      },
      {
        // Активный лимитный ордер на покупку, еще не совпавший ни с одним другим ордером
        id: '3e61b743-3414-4d7e-bafe-870123a2a5c2',
        creatorAddress: '0x10ad096c5d7d43aae93263e9a55b119724f66b14',
        tokenA: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
        tokenB: '0x7f6d3ac572051f98f0634b5ea6ac222eedc87953', // USDC
        amountA: 1000,
        amountB: 1010,
        amountLeftToFill: 1000,
        isActive: true,
        orderType: 'LIMIT',
        orderSide: 'BUY',
        filled: 0,
        executionPrice: 1.01,
        fee: 0.1,
        orderStatus: 'ACTIVE',
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
