"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { marketEventSchema } from "@/lib/validation/admin";
import type { FormState } from "@/lib/actions/auth";

export async function createMarketEventAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = marketEventSchema.safeParse({
    category: formData.get("category"),
    headline: formData.get("headline"),
    description: formData.get("description") || undefined,
    assetId: formData.get("assetId") || "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.marketEvent.create({
    data: {
      category: parsed.data.category,
      headline: parsed.data.headline,
      description: parsed.data.description || null,
      assetId: parsed.data.assetId || null,
    },
  });

  revalidatePath("/admin/market-events");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteMarketEventAction(eventId: string) {
  await requireAdmin();
  await prisma.marketEvent.delete({ where: { id: eventId } });
  revalidatePath("/admin/market-events");
  revalidatePath("/dashboard");
}
