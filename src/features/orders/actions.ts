"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      client: true,
      lead: true,
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrder(data: { clientId: string, status?: string, items: { productId: string, quantity: number }[] }) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch products to get current prices and compute total
      let totalAmount = 0;
      const orderItems = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        
        totalAmount += (product.price || 0) * item.quantity;
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price || 0
        });
      }

      // 2. Create Order
      const order = await tx.order.create({
        data: {
          clientId: data.clientId,
          totalAmount,
          status: (data.status as any) || "PENDING",
          items: {
            create: orderItems
          }
        },
      });

      revalidatePath("/orders");
      return { success: true, order };
    });
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function updateOrder(id: string, data: { clientId: string, status: string, items: { productId: string, quantity: number }[] }) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Delete existing items
      await tx.orderItem.deleteMany({ where: { orderId: id } });

      // 2. Fetch products and compute total
      let totalAmount = 0;
      const orderItems = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        
        totalAmount += (product.price || 0) * item.quantity;
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price || 0
        });
      }

      // 3. Update Order and create new items
      const order = await tx.order.update({
        where: { id },
        data: {
          clientId: data.clientId,
          totalAmount,
          status: data.status as any,
          items: {
            create: orderItems
          }
        },
      });

      revalidatePath("/orders");
      return { success: true, order };
    });
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
    
    revalidatePath("/orders");
    return { success: true, order };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
