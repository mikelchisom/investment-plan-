"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { depositSchema } from "@/lib/validation/investment";
import { generateReference } from "@/lib/format";
import { PLATFORM_SETTING_KEYS } from "@/lib/constants";
import type { FormState } from "@/lib/actions/auth";

export async function requestDepositAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const parsed = depositSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const prefixSetting = await prisma.platformSetting.findUnique({
    where: { key: PLATFORM_SETTING_KEYS.DEPOSIT_REFERENCE_PREFIX },
  });
  const reference = generateReference(prefixSetting?.value ?? "DEP");

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        status: "PENDING",
        amount: parsed.data.amount,
        reference,
        description: "Deposit request awaiting confirmation",
      },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        type: "INFO",
        title: "Deposit request submitted",
        message: `Your deposit request of $${parsed.data.amount.toLocaleString()} (ref ${reference}) is pending review.`,
      },
    }),
  ]);

  revalidatePath("/deposit");
  revalidatePath("/transactions");

  return { success: true };
}
