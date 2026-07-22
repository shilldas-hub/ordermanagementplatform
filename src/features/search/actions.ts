"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";

export async function globalSearch(query: string) {
  const user = await getCurrentUser();
  if (!user) return { leads: [], clients: [], orders: [] };

  if (!query || query.trim().length < 2) {
    return { leads: [], clients: [], orders: [] };
  }

  const q = query.trim();

  // Based on RBAC, we should ideally filter by region or assignment.
  // For now, we will do a global search, but limit the results.
  const [leads, clients, orders] = await Promise.all([
    prisma.lead.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { client: { companyName: { contains: q, mode: 'insensitive' } } }
        ]
      },
      take: 5,
      include: { client: { select: { companyName: true } } }
    }),
    prisma.client.findMany({
      where: {
        deletedAt: null,
        OR: [
          { companyName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5
    }),
    prisma.order.findMany({
      where: {
        deletedAt: null,
        OR: [
          { orderNumber: { contains: q, mode: 'insensitive' } },
          { client: { companyName: { contains: q, mode: 'insensitive' } } }
        ]
      },
      take: 5,
      include: { client: { select: { companyName: true } } }
    })
  ]);

  return { leads, clients, orders };
}
