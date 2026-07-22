"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";
import { revalidatePath } from "next/cache";

export async function getPendingClientMappings() {
  return await prisma.clientMapping.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPendingSkuMappings() {
  return await prisma.skuMapping.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });
}

export async function linkClientMapping(mappingId: string, unifiedClientId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") return { success: false, error: "Unauthorized" };

  try {
    await prisma.clientMapping.update({
      where: { id: mappingId },
      data: {
        unifiedClientId: unifiedClientId,
        status: 'MAPPED'
      }
    });
    revalidatePath("/data-sync");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUnifiedClientFromMapping(mappingId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const mapping = await prisma.clientMapping.findUnique({ where: { id: mappingId } });
    if (!mapping) throw new Error("Mapping not found");

    const rawData = mapping.rawData as any;
    
    // First ensure region exists based on sourceLocation
    let region = await prisma.region.findFirst({ where: { name: mapping.sourceLocation } });
    if (!region) {
      region = await prisma.region.create({ data: { name: mapping.sourceLocation } });
    }

    const newClient = await prisma.client.create({
      data: {
        companyName: mapping.sourceName || "Unknown Client",
        contactPerson: rawData?.contactPerson || "",
        email: rawData?.email || null,
        phone: rawData?.phone || "",
        address: rawData?.address || "",
        regionId: region.id,
        createdById: user.id
      }
    });

    await prisma.clientMapping.update({
      where: { id: mappingId },
      data: {
        unifiedClientId: newClient.id,
        status: 'MAPPED'
      }
    });

    revalidatePath("/data-sync");
    return { success: true, clientId: newClient.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
