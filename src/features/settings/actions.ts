"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";
import { revalidatePath } from "next/cache";

export async function createPipelineStage(name: string, order: number) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const stage = await prisma.pipelineStage.create({
      data: {
        name,
        order,
      }
    });

    revalidatePath("/settings");
    revalidatePath("/leads");
    return { stage };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePipelineStage(id: string, name: string, order: number) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const stage = await prisma.pipelineStage.update({
      where: { id },
      data: { name, order }
    });

    revalidatePath("/settings");
    revalidatePath("/leads");
    return { stage };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePipelineStage(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    // Check if leads exist
    const leadsCount = await prisma.lead.count({ where: { stageId: id } });
    if (leadsCount > 0) {
      return { error: `Cannot delete stage. ${leadsCount} leads are currently in this stage.` };
    }

    await prisma.pipelineStage.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    revalidatePath("/settings");
    revalidatePath("/leads");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
