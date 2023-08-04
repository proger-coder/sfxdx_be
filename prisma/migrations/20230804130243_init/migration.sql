-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "tokenA" TEXT NOT NULL,
    "tokenB" TEXT NOT NULL,
    "amountA" DECIMAL(65,30) NOT NULL,
    "amountB" DECIMAL(65,30) NOT NULL,
    "amountLeftToFill" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_search_index" ON "Order"("tokenA", "tokenB", "creatorAddress");
