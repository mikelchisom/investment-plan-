import { z } from "zod";

export const investAmountSchema = z.object({
  planId: z.string().min(1),
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
});

export const depositSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than zero").max(1_000_000, "Amount too large"),
});
