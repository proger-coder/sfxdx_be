-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LIMIT', 'MARKET');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "tokenA" TEXT NOT NULL,
    "tokenB" TEXT NOT NULL,
    "amountA" TEXT NOT NULL,
    "amountB" TEXT NOT NULL,
    "amountLeftToFill" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "orderType" "OrderType" NOT NULL DEFAULT 'LIMIT',
    "orderSide" "OrderSide" NOT NULL DEFAULT 'UNKNOWN',
    "filled" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "executionPrice" DECIMAL(65,30),
    "fee" DECIMAL(65,30),
    "cancelable" BOOLEAN DEFAULT true,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_search_index" ON "Order"("tokenA", "tokenB", "creatorAddress");
