"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { openTradeSchema, tradeNotesSchema } from "@/lib/validation/trading";
import { toNumber, formatCurrency } from "@/lib/format";
import type { FormState } from "@/lib/actions/auth";

export async function openTradeAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const parsed = openTradeSchema.safeParse({
    assetId: formData.get("assetId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { assetId, amount } = parsed.data;

  const [asset, portfolio] = await Promise.all([
    prisma.asset.findUnique({ where: { id: assetId } }),
    prisma.portfolio.findUnique({ where: { userId: user.id } }),
  ]);

  if (!asset || !asset.isActive) {
    return { error: "This asset isn't available to trade right now." };
  }
  if (!portfolio || toNumber(portfolio.cashBalance) < amount) {
    return { error: "Insufficient balance for this trade." };
  }

  const entryPrice = toNumber(asset.price);
  const quantity = amount / entryPrice;

  await prisma.$transaction([
    prisma.paperTrade.create({
      data: {
        userId: user.id,
        assetId: asset.id,
        quantity,
        entryPrice,
      },
    }),
    prisma.portfolio.update({
      where: { userId: user.id },
      data: { cashBalance: { decrement: amount } },
    }),
  ]);

  revalidatePath("/trade");
  revalidatePath(`/trade/${asset.symbol}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function closeTradeAction(tradeId: string) {
  const user = await requireUser();

  const trade = await prisma.paperTrade.findUnique({
    where: { id: tradeId },
    include: { asset: true },
  });
  if (!trade || trade.userId !== user.id || trade.status !== "OPEN") return;

  const exitPrice = toNumber(trade.asset.price);
  const quantity = toNumber(trade.quantity);
  const entryPrice = toNumber(trade.entryPrice);
  const proceeds = exitPrice * quantity;
  const pnl = (exitPrice - entryPrice) * quantity;

  await prisma.$transaction([
    prisma.paperTrade.update({
      where: { id: trade.id },
      data: { status: "CLOSED", exitPrice, pnl, closedAt: new Date() },
    }),
    prisma.portfolio.update({
      where: { userId: user.id },
      data: { cashBalance: { increment: proceeds } },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        type: pnl >= 0 ? "SUCCESS" : "WARNING",
        title: "Trade closed",
        message: `Closed ${trade.asset.symbol} at ${formatCurrency(exitPrice)}. ${pnl >= 0 ? "+" : ""}${formatCurrency(pnl)} P&L.`,
      },
    }),
  ]);

  revalidatePath("/trade");
  revalidatePath(`/trade/${trade.asset.symbol}`);
  revalidatePath("/dashboard");
}

export async function updateTradeNotesAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const parsed = tradeNotesSchema.safeParse({
    tradeId: formData.get("tradeId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const trade = await prisma.paperTrade.findUnique({ where: { id: parsed.data.tradeId } });
  if (!trade || trade.userId !== user.id) {
    return { error: "Trade not found." };
  }

  await prisma.paperTrade.update({
    where: { id: trade.id },
    data: { notes: parsed.data.notes ?? "" },
  });

  revalidatePath("/trade");
  return { success: true };
}
