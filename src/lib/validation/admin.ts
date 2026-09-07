import { z } from "zod";

export const planSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().min(10).max(2000),
  minAmount: z.coerce.number().positive(),
  maxAmount: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  returnRateBps: z.coerce.number().int().min(0).max(100_00),
  durationDays: z.coerce.number().int().positive().max(3650),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const assetPriceSchema = z.object({
  assetId: z.string().min(1),
  price: z.coerce.number().positive(),
});

export const marketEventSchema = z.object({
  category: z.enum(["RATE_CHANGE", "PRICE_MOVE", "ACCOUNT_ACTIVITY", "PLATFORM_NEWS"]),
  headline: z.string().trim().min(3).max(200),
  description: z.string().trim().max(1000).optional(),
  assetId: z.union([z.string().min(1), z.literal("")]).optional(),
});

export const balanceAdjustmentSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().refine((n) => n !== 0, "Amount cannot be zero"),
  reason: z.string().trim().min(3).max(200),
});

export const platformSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().trim().max(5000),
});
