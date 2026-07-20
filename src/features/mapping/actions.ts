"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";
import { revalidatePath } from "next/cache";
import { MappingStatus } from "@prisma/client";

export async function getClientMappings() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  return await prisma.clientMapping.findMany({
    include: {
      unifiedClient: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getActiveClients() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  return await prisma.client.findMany({
    where: { deletedAt: null },
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, gstNumber: true }
  });
}

export async function approveClientMapping(mappingId: string, unifiedClientId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.clientMapping.update({
    where: { id: mappingId },
    data: {
      unifiedClientId,
      status: MappingStatus.MAPPED,
    }
  });

  revalidatePath("/mappings");
  return { success: true };
}

export async function rejectClientMapping(mappingId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.clientMapping.update({
    where: { id: mappingId },
    data: {
      unifiedClientId: null,
      status: MappingStatus.CONFLICT,
    }
  });

  revalidatePath("/mappings");
  return { success: true };
}
