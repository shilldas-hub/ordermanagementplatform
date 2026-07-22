"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";

export async function getProducts() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}
