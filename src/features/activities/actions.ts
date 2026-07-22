"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";
import { revalidatePath } from "next/cache";

export async function getActivities(targetId: string, type: 'lead' | 'client' | 'order') {
  const where: any = {};
  if (type === 'lead') where.leadId = targetId;
  if (type === 'client') where.clientId = targetId;
  if (type === 'order') where.orderId = targetId;

  return await prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true, id: true } } }
  });
}

export async function createNoteActivity(targetId: string, type: 'lead' | 'client' | 'order', note: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const data: any = {
      type: "NOTE",
      description: note,
      createdById: user.id
    };
    if (type === 'lead') data.leadId = targetId;
    if (type === 'client') data.clientId = targetId;
    if (type === 'order') data.orderId = targetId;

    const activity = await prisma.activity.create({ data, include: { createdBy: { select: { name: true, id: true } } } });

    revalidatePath(`/leads`);
    revalidatePath(`/clients`);
    revalidatePath(`/orders`);
    return { success: true, activity };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
