"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function getDispatchOrders() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "DISPATCH" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  return await prisma.order.findMany({
    where: {
      deletedAt: null,
      status: {
        in: [
          OrderStatus.PENDING_ACCOUNT_CREATION,
          OrderStatus.PENDING_DISPATCH_REVIEW,
          OrderStatus.READY_FOR_DISPATCH,
          OrderStatus.BACKORDERED
        ]
      }
    },
    include: {
      client: true,
      lead: true,
      assignedTo: true,
      purchaseRequests: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "DISPATCH" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status, updatedById: user.id }
  });

  if (note) {
    await prisma.activity.create({
      data: {
        type: "NOTE",
        description: `Dispatch Note: ${note}`,
        orderId: order.id,
        createdById: user.id,
      }
    });
  }

  if (status === "BACKORDERED") {
    // Auto-create purchase request
    await prisma.purchaseRequest.create({
      data: {
        orderId: order.id,
        status: "PENDING"
      }
    });
    
    // Auto-notify the sales executive
    if (order.assignedToId) {
      await prisma.notification.create({
        data: {
          userId: order.assignedToId,
          message: `Order ${order.orderNumber} is BACKORDERED. Purchase Request initiated.`
        }
      });
    }
  }

  revalidatePath("/dispatch");
  return { success: true, order };
}
