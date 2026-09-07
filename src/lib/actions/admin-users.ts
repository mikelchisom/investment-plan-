"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { balanceAdjustmentSchema } from "@/lib/validation/admin";
import { formatCurrency } from "@/lib/format";
import type { FormState } from "@/lib/actions/auth";

export async function adjustUserBalanceAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = balanceAdjustmentSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { userId, amount, reason } = parsed.data;

  const portfolio = await prisma.portfolio.findUnique({ where: { userId } });
  if (!portfolio) return { error: "User has no portfolio record." };

  await prisma.$transaction([
    prisma.portfolio.update({
      where: { userId },
      data: { cashBalance: { increment: amount } },
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: "ADJUSTMENT",
        status: "COMPLETED",
        amount,
        description: `Admin adjustment (${admin.email}): ${reason}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: "INFO",
        title: "Simulated balance adjusted",
        message: `An administrator adjusted your demo balance by ${amount >= 0 ? "+" : ""}${formatCurrency(amount)}. Reason: ${reason}`,
      },
    }),
  ]);

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActiveAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}
