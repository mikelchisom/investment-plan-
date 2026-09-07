"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { assetPriceSchema } from "@/lib/validation/admin";
import { toNumber } from "@/lib/format";
import type { FormState } from "@/lib/actions/auth";

export async function updateAssetPriceAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = assetPriceSchema.safeParse({
    assetId: formData.get("assetId"),
    price: formData.get("price"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const asset = await prisma.asset.findUnique({ where: { id: parsed.data.assetId } });
  if (!asset) return { error: "Asset not found." };

  await prisma.asset.update({
    where: { id: asset.id },
    data: {
      previousPrice: toNumber(asset.price),
      price: parsed.data.price,
    },
  });

  await prisma.marketEvent.create({
    data: {
      category: "PRICE_MOVE",
      headline: `${asset.symbol} simulated price updated to $${parsed.data.price.toLocaleString()}`,
      description: "Price updated by an administrator for platform simulation purposes.",
      assetId: asset.id,
    },
  });

  revalidatePath("/admin/assets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleAssetActiveAction(assetId: string) {
  await requireAdmin();

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return;

  await prisma.asset.update({
    where: { id: assetId },
    data: { isActive: !asset.isActive },
  });

  revalidatePath("/admin/assets");
  revalidatePath("/dashboard");
}
