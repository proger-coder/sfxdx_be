-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LIMIT', 'MARKET');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ACTIVE', 'PARTIALLY_FILLED', 'FILLED');

-- CreateTable
CREATE TABLE "Order" (
    "id" BIGINT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "tokenA" TEXT NOT NULL,
    "tokenB" TEXT NOT NULL,
    "amountA" DECIMAL(65,30) NOT NULL,
    "amountB" DECIMAL(65,30) NOT NULL,
    "amountLeftToFill" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "orderType" "OrderType" NOT NULL DEFAULT 'LIMIT',
    "orderSide" "OrderSide" NOT NULL DEFAULT 'UNKNOWN',
    "filled" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "executionPrice" DECIMAL(65,30),
    "fee" DECIMAL(65,30),
    "cancelable" BOOLEAN DEFAULT true,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_search_index" ON "Order"("tokenA", "tokenB", "creatorAddress");
