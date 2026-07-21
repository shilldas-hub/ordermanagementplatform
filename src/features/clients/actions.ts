"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { clientSchema, ClientFormValues } from "./schema";

import { Role } from "@prisma/client";

import { getCurrentUser } from "@/features/auth/utils";

export async function getClients(search: string = "", regionId?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const whereClause: any = {
    deletedAt: null,
    companyName: {
      contains: search,
      mode: "insensitive",
    },
  };

  if (regionId && regionId !== "all") {
    whereClause.regionId = regionId;
  }

  // RBAC Filtering
  if (user.role === "REGIONAL_MANAGER") {
    whereClause.regionId = user.regionId;
  } else if (user.role === "SALES_EXECUTIVE") {
    whereClause.assignedToId = user.id;
  }
  // SUPER_ADMIN sees all, DISPATCH and ACCOUNTS see all (read-only handled in UI)

  const clients = await prisma.client.findMany({
    where: whereClause,
    include: {
      region: true,
      assignedTo: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return clients;
}

export async function createClient(data: ClientFormValues) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS") {
    return { error: "Unauthorized to create clients" };
  }

  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const values = parsed.data;

  try {
    const client = await prisma.client.create({
      data: {
        companyName: values.companyName,
        contactPerson: values.contactPerson || null,
        email: values.email || null,
        phone: values.phone || null,
        gstNumber: values.gstNumber || null,
        address: values.address || null,
        regionId: values.regionId || null,

        status: values.status,
        assignedToId: values.assignedToId || user.id,
        createdById: user.id,
      },
    });

    revalidatePath("/clients");
    return { success: true, client };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('gstNumber')) {
      return { error: "GST Number must be unique." };
    }
    return { error: "Failed to create client" };
  }
}

export async function updateClient(data: ClientFormValues) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS") {
    return { error: "Unauthorized to edit clients" };
  }

  const parsed = clientSchema.safeParse(data);
  if (!parsed.success || !parsed.data.id) {
    return { error: "Invalid form data" };
  }

  const values = parsed.data;

  // RBAC Check for existing client
  const existing = await prisma.client.findUnique({ where: { id: values.id } });
  if (!existing) return { error: "Client not found" };

  if (user.role === "REGIONAL_MANAGER" && existing.regionId !== user.regionId) {
    return { error: "Unauthorized: Client outside of your region" };
  }
  if (user.role === "SALES_EXECUTIVE" && existing.assignedToId !== user.id) {
    return { error: "Unauthorized: Client is not assigned to you" };
  }

  try {
    const client = await prisma.client.update({
      where: { id: values.id },
      data: {
        companyName: values.companyName,
        contactPerson: values.contactPerson || null,
        email: values.email || null,
        phone: values.phone || null,
        gstNumber: values.gstNumber || null,
        address: values.address || null,
        regionId: values.regionId || null,

        status: values.status,
        assignedToId: values.assignedToId || null,
        updatedById: user.id,
      },
    });

    revalidatePath("/clients");
    return { success: true, client };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('gstNumber')) {
      return { error: "GST Number must be unique." };
    }
    return { error: "Failed to update client" };
  }
}

export async function deleteClient(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS" || user.role === "SALES_EXECUTIVE") {
    // Usually sales executives can't delete clients, only managers or admins.
    // If requirement allows Sales Exec to delete, we can remove the condition.
    // The prompt said: "Sales Executive: Create and edit assigned clients only". Thus they cannot delete.
    return { error: "Unauthorized to delete clients" };
  }

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return { error: "Client not found" };

  if (user.role === "REGIONAL_MANAGER" && existing.regionId !== user.regionId) {
    return { error: "Unauthorized: Client outside of your region" };
  }

  try {
    // Soft delete
    await prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete client" };
  }
}
