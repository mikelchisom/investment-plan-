"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { assetPriceSchema } from "@/lib/validation/admin";
import { priceTickSchema } from "@/lib/validation/trading";
import { ensureSeedCandles } from "@/lib/candles";
import { toNumber } from "@/lib/format";
import type { FormState } from "@/lib/actions/auth";

export async function updateAssetPriceAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = assetPriceSchema.safeParse({
    assetId: formData.get("assetId"),
    price: formData.get("price"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const asset = await prisma.asset.findUnique({ where: { id: parsed.data.assetId } });
  if (!asset) return { error: "Asset not found." };

  await prisma.asset.update({
    where: { id: asset.id },
    data: {
      previousPrice: toNumber(asset.price),
      price: parsed.data.price,
    },
  });

  await prisma.marketEvent.create({
    data: {
      category: "PRICE_MOVE",
      headline: `${asset.symbol} price updated to $${parsed.data.price.toLocaleString()}`,
      description: "Price updated by an administrator.",
      assetId: asset.id,
    },
  });

  revalidatePath("/admin/assets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleAssetActiveAction(assetId: string) {
  await requireAdmin();

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return;

  await prisma.asset.update({
    where: { id: assetId },
    data: { isActive: !asset.isActive },
  });

  revalidatePath("/admin/assets");
  revalidatePath("/dashboard");
}

export async function pushPriceTickAction(assetId: string, direction: "UP" | "DOWN", stepBps: number) {
  await requireAdmin();

  const parsed = priceTickSchema.safeParse({ assetId, direction, stepBps });
  if (!parsed.success) return;

  await ensureSeedCandles(assetId);

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return;

  const open = toNumber(asset.price);
  const stepPct = parsed.data.stepBps / 10_000;
  const delta = open * stepPct;
  const rawClose = parsed.data.direction === "UP" ? open + delta : open - delta;
  const close = Math.max(0.0001, rawClose);

  const wick = Math.max(Math.abs(close - open) * 0.4, open * 0.001);
  const high = Math.max(open, close) + Math.random() * wick;
  const low = Math.max(0.0001, Math.min(open, close) - Math.random() * wick);

  await prisma.$transaction([
    prisma.priceCandle.create({
      data: { assetId, open, high, low, close },
    }),
    prisma.asset.update({
      where: { id: assetId },
      data: { previousPrice: open, price: close },
    }),
    prisma.marketEvent.create({
      data: {
        category: "PRICE_MOVE",
        assetId,
        headline: `${asset.symbol} ${parsed.data.direction === "UP" ? "up" : "down"} to $${close.toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
      },
    }),
  ]);

  revalidatePath("/admin/assets");
  revalidatePath(`/admin/assets/${assetId}/trade-control`);
  revalidatePath("/trade");
  revalidatePath(`/trade/${asset.symbol}`);
  revalidatePath("/dashboard");
}
