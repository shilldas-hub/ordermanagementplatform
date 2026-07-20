"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      client: true,
      lead: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrder(data: { clientId: string, totalAmount: number, status?: string }) {
  try {
    const order = await prisma.order.create({
      data: {
        clientId: data.clientId,
        totalAmount: data.totalAmount,
        status: (data.status as any) || "PENDING",
      },
    });
    revalidatePath("/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function updateOrder(id: string, data: { clientId: string, totalAmount: number, status: string }) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        clientId: data.clientId,
        totalAmount: data.totalAmount,
        status: data.status as any,
      },
    });
    revalidatePath("/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
