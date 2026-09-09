import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

/**
 * Ensures a chart has some starting history so it isn't a single flat point
 * the first time anyone opens it. Only runs once per asset (skipped if any
 * candle already exists) and builds a gentle random walk ending at the
 * asset's current price — after that, every further candle comes only from
 * an admin pressing Up/Down.
 */
export async function ensureSeedCandles(assetId: string, count = 30) {
  const existing = await prisma.priceCandle.count({ where: { assetId } });
  if (existing > 0) return;

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return;

  const target = toNumber(asset.price);
  const start = target * (0.9 + Math.random() * 0.05);

  const now = Date.now();
  const intervalMs = 30 * 60 * 1000; // 30 minutes apart
  let price = start;

  const candles: { assetId: string; timestamp: Date; open: number; high: number; low: number; close: number }[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    // Drift gently toward the current live price as we approach "now".
    const progress = 1 - i / count;
    const pull = (target - open) * progress * 0.15;
    const noise = open * (Math.random() - 0.5) * 0.01;
    const close = Math.max(0.0001, open + pull + noise);
    const wick = Math.max(Math.abs(close - open) * 0.4, open * 0.002);
    const high = Math.max(open, close) + Math.random() * wick;
    const low = Math.max(0.0001, Math.min(open, close) - Math.random() * wick);

    candles.push({
      assetId,
      timestamp: new Date(now - i * intervalMs),
      open,
      high,
      low,
      close,
    });
    price = close;
  }

  // Make sure the very last seeded candle actually closes at the live price.
  candles[candles.length - 1].close = target;
  candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, target);
  candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, target);

  await prisma.priceCandle.createMany({ data: candles });
}

export async function getCandles(assetId: string, take = 60) {
  await ensureSeedCandles(assetId);
  const recent = await prisma.priceCandle.findMany({
    where: { assetId },
    orderBy: { timestamp: "desc" },
    take,
  });
  const candles = recent.reverse();
  return candles.map((c) => ({
    time: c.timestamp.toISOString(),
    open: toNumber(c.open),
    high: toNumber(c.high),
    low: toNumber(c.low),
    close: toNumber(c.close),
  }));
}
