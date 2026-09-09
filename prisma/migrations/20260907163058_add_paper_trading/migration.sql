-- CreateEnum
CREATE TYPE "PaperTradeStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "PriceCandle" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "open" DECIMAL(14,4) NOT NULL,
    "high" DECIMAL(14,4) NOT NULL,
    "low" DECIMAL(14,4) NOT NULL,
    "close" DECIMAL(14,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceCandle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperTrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "entryPrice" DECIMAL(14,4) NOT NULL,
    "exitPrice" DECIMAL(14,4),
    "status" "PaperTradeStatus" NOT NULL DEFAULT 'OPEN',
    "pnl" DECIMAL(14,2),
    "notes" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "PaperTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceCandle_assetId_timestamp_idx" ON "PriceCandle"("assetId", "timestamp");

-- CreateIndex
CREATE INDEX "PaperTrade_userId_idx" ON "PaperTrade"("userId");

-- CreateIndex
CREATE INDEX "PaperTrade_assetId_idx" ON "PaperTrade"("assetId");

-- AddForeignKey
ALTER TABLE "PriceCandle" ADD CONSTRAINT "PriceCandle_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTrade" ADD CONSTRAINT "PaperTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaperTrade" ADD CONSTRAINT "PaperTrade_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
