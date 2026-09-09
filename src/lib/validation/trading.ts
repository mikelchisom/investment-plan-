import { z } from "zod";

export const priceTickSchema = z.object({
  assetId: z.string().min(1),
  direction: z.enum(["UP", "DOWN"]),
  stepBps: z.coerce.number().int().min(1).max(2000), // 0.01% .. 20%
});

export const openTradeSchema = z.object({
  assetId: z.string().min(1),
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
});

export const closeTradeSchema = z.object({
  tradeId: z.string().min(1),
});

export const tradeNotesSchema = z.object({
  tradeId: z.string().min(1),
  notes: z.string().trim().max(2000).optional(),
});
