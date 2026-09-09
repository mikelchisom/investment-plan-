"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export async function approveDepositAction(transactionId: string) {
  await requireAdmin();

  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.type !== "DEPOSIT" || tx.status !== "PENDING") return;

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "COMPLETED" },
    }),
    prisma.portfolio.update({
      where: { userId: tx.userId },
      data: {
        cashBalance: { increment: tx.amount },
        totalDeposited: { increment: tx.amount },
      },
    }),
    prisma.notification.create({
      data: {
        userId: tx.userId,
        type: "SUCCESS",
        title: "Deposit confirmed",
        message: `Your deposit of ${formatCurrency(tx.amount)} was confirmed and credited to your balance.`,
      },
    }),
  ]);

  revalidatePath("/admin/transactions");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function rejectDepositAction(transactionId: string) {
  await requireAdmin();

  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.type !== "DEPOSIT" || tx.status !== "PENDING") return;

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "FAILED" },
    }),
    prisma.notification.create({
      data: {
        userId: tx.userId,
        type: "WARNING",
        title: "Deposit rejected",
        message: `Your deposit request of ${formatCurrency(tx.amount)} was rejected by an administrator.`,
      },
    }),
  ]);

  revalidatePath("/admin/transactions");
  revalidatePath("/transactions");
}
