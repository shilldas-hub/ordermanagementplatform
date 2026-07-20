"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPipelineStages() {
  return await prisma.pipelineStage.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' }
  });
}

export async function createPipelineStage(name: string, order: number, color?: string) {
  try {
    const stage = await prisma.pipelineStage.create({
      data: { name, order, color }
    });
    revalidatePath("/settings");
    return { success: true, stage };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Stage with this name already exists." };
    return { error: "Failed to create stage" };
  }
}

export async function updatePipelineStage(id: string, name: string, order: number, color?: string) {
  try {
    const stage = await prisma.pipelineStage.update({
      where: { id },
      data: { name, order, color }
    });
    revalidatePath("/settings");
    return { success: true, stage };
  } catch (error) {
    return { error: "Failed to update stage" };
  }
}

export async function deletePipelineStage(id: string) {
  try {
    // Check if any leads are using this stage
    const count = await prisma.lead.count({
      where: { stageId: id, deletedAt: null }
    });
    
    if (count > 0) {
      return { error: `Cannot delete: ${count} active leads are currently in this stage.` };
    }

    await prisma.pipelineStage.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete stage" };
  }
}
