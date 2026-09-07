"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { planSchema } from "@/lib/validation/admin";
import type { FormState } from "@/lib/actions/auth";

function parsePlanForm(formData: FormData) {
  return planSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    minAmount: formData.get("minAmount"),
    maxAmount: formData.get("maxAmount") || "",
    returnRateBps: formData.get("returnRateBps"),
    durationDays: formData.get("durationDays"),
    riskLevel: formData.get("riskLevel"),
  });
}

export async function createPlanAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parsePlanForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.investmentPlan.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: "A plan with this slug already exists." };
  }

  const { maxAmount, ...rest } = parsed.data;

  await prisma.investmentPlan.create({
    data: {
      ...rest,
      maxAmount: maxAmount === "" || maxAmount === undefined ? null : maxAmount,
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  redirect("/admin/plans");
}

export async function updatePlanAction(
  planId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parsePlanForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.investmentPlan.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: planId } },
  });
  if (existing) {
    return { error: "Another plan already uses this slug." };
  }

  const { maxAmount, ...rest } = parsed.data;

  await prisma.investmentPlan.update({
    where: { id: planId },
    data: {
      ...rest,
      maxAmount: maxAmount === "" || maxAmount === undefined ? null : maxAmount,
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  revalidatePath(`/plans/${parsed.data.slug}`);
  return { success: true };
}

export async function togglePlanActiveAction(planId: string) {
  await requireAdmin();

  const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
  if (!plan) return;

  await prisma.investmentPlan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/plans");
}

export async function deletePlanAction(planId: string) {
  await requireAdmin();

  const activeInvestments = await prisma.userInvestment.count({
    where: { planId, status: "ACTIVE" },
  });
  if (activeInvestments > 0) {
    throw new Error("Cannot delete a plan with active simulated investments. Disable it instead.");
  }

  await prisma.investmentPlan.delete({ where: { id: planId } });

  revalidatePath("/admin/plans");
  revalidatePath("/plans");
}
