"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { investAmountSchema } from "@/lib/validation/investment";
import { toNumber, formatCurrency } from "@/lib/format";
import type { FormState } from "@/lib/actions/auth";

export async function investInPlanAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const parsed = investAmountSchema.safeParse({
    planId: formData.get("planId"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { planId, amount } = parsed.data;

  const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    return { error: "This investment plan is not currently available." };
  }

  if (amount < toNumber(plan.minAmount)) {
    return { error: `Minimum demo investment for this plan is ${formatCurrency(plan.minAmount)}.` };
  }
  if (plan.maxAmount && amount > toNumber(plan.maxAmount)) {
    return { error: `Maximum demo investment for this plan is ${formatCurrency(plan.maxAmount)}.` };
  }

  const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } });
  if (!portfolio || toNumber(portfolio.cashBalance) < amount) {
    return { error: "Insufficient simulated balance for this investment." };
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.durationDays);

  await prisma.$transaction(async (tx) => {
    const investment = await tx.userInvestment.create({
      data: {
        userId: user.id,
        planId: plan.id,
        principal: amount,
        currentValue: amount,
        endDate,
      },
    });

    await tx.portfolio.update({
      where: { userId: user.id },
      data: {
        cashBalance: { decrement: amount },
        totalInvested: { increment: amount },
      },
    });

    await tx.transaction.create({
      data: {
        userId: user.id,
        userInvestmentId: investment.id,
        type: "INVESTMENT",
        status: "COMPLETED",
        amount,
        description: `Simulated investment in ${plan.name}`,
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        type: "SUCCESS",
        title: "Simulated investment created",
        message: `You committed ${formatCurrency(amount)} (demo) to ${plan.name}.`,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/portfolio");
  revalidatePath("/plans");

  return { success: true };
}
