"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/utils";
import { revalidatePath } from "next/cache";

export async function getFinancialRecords() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ACCOUNTS")) {
    throw new Error("Unauthorized");
  }

  return await prisma.financialRecord.findMany({
    orderBy: { period: "desc" }
  });
}

export async function addManualFinancialRecord(data: { location: string; period: string; revenue: number; expenses: number; profit: number }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ACCOUNTS")) {
    throw new Error("Unauthorized");
  }

  const record = await prisma.financialRecord.create({
    data: {
      location: data.location,
      period: new Date(data.period),
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.profit,
      source: "MANUAL",
      createdById: user.id
    }
  });

  revalidatePath("/reports/financials");
  return { success: true, record };
}
