"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { leadSchema, LeadFormValues } from "./schema";
import { getCurrentUser } from "@/features/auth/utils";
import { ActivityType } from "@prisma/client";

export async function getLeads(search: string = "", stageId?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const whereClause: any = {
    deletedAt: null,
    title: {
      contains: search,
      mode: "insensitive",
    },
  };

  if (stageId && stageId !== 'all') {
    whereClause.stageId = stageId;
  }

  if (user.role === "REGIONAL_MANAGER") {
    whereClause.regionId = user.regionId;
  } else if (user.role === "SALES_EXECUTIVE") {
    whereClause.assignedToId = user.id;
  }

  const leads = await prisma.lead.findMany({
    where: whereClause,
    include: {
      client: true,
      stage: true,
      assignedTo: true,
      region: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return leads;
}

export async function getLeadDetails(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUnique({
    where: { id, deletedAt: null },
    include: {
      client: true,
      stage: true,
      assignedTo: true,
      region: true,
      activities: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: true, attachments: true }
      },
    },
  });

  if (!lead) throw new Error("Lead not found");

  // RBAC checks
  if (user.role === "REGIONAL_MANAGER" && lead.regionId !== user.regionId) {
    throw new Error("Unauthorized access to lead");
  }
  if (user.role === "SALES_EXECUTIVE" && lead.assignedToId !== user.id) {
    throw new Error("Unauthorized access to lead");
  }

  return lead;
}

export async function createLead(data: LeadFormValues) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS") {
    return { error: "Unauthorized to create leads" };
  }

  const result = leadSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid data" };
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        ...result.data,
        expectedClosingDate: result.data.expectedClosingDate ? new Date(result.data.expectedClosingDate) : null,
        assignedToId: result.data.assignedToId || user.id,
        createdById: user.id,
        updatedById: user.id,
      },
    });

    await prisma.activity.create({
      data: {
        type: ActivityType.NOTE,
        description: "Lead created",
        leadId: lead.id,
        createdById: user.id,
      }
    });

    revalidatePath("/leads");
    return { success: true, lead };
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return { error: "Failed to create lead" };
  }
}

export async function updateLead(data: LeadFormValues) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS") {
    return { error: "Unauthorized to edit leads" };
  }

  const result = leadSchema.safeParse(data);
  if (!result.success || !data.id) {
    return { error: "Invalid data" };
  }

  try {
    // Check permission
    const existing = await prisma.lead.findUnique({ where: { id: data.id } });
    if (!existing) return { error: "Lead not found" };
    if (user.role === "REGIONAL_MANAGER" && existing.regionId !== user.regionId) {
      return { error: "Unauthorized" };
    }
    if (user.role === "SALES_EXECUTIVE" && existing.assignedToId !== user.id) {
      return { error: "Unauthorized" };
    }

    const changes: string[] = [];

    // Track standard fields
    if (existing.title !== data.title) changes.push(`Title changed to "${data.title}"`);
    if (existing.expectedValue !== data.expectedValue) changes.push(`Expected Value changed to ₹${data.expectedValue?.toLocaleString('en-IN')}`);
    if (existing.priority !== data.priority) changes.push(`Priority changed to ${data.priority}`);
    if (existing.source !== data.source) changes.push(`Source changed to ${data.source}`);
    if (existing.description !== data.description) changes.push(`Description updated`);
    
    // Check Date
    const existingDate = existing.expectedClosingDate ? existing.expectedClosingDate.toISOString().split('T')[0] : null;
    const newDataDate = data.expectedClosingDate ? new Date(data.expectedClosingDate).toISOString().split('T')[0] : null;
    if (existingDate !== newDataDate) changes.push(`Closing Date changed to ${newDataDate}`);

    // Check Relations
    if (existing.clientId !== data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: data.clientId } });
      changes.push(`Client changed to ${client?.companyName}`);
    }
    if (existing.assignedToId !== data.assignedToId) {
      if (data.assignedToId) {
        const userAssigned = await prisma.user.findUnique({ where: { id: data.assignedToId } });
        changes.push(`Assigned to ${userAssigned?.name}`);
      } else {
        changes.push(`Unassigned`);
      }
    }
    if (existing.regionId !== data.regionId) {
      const region = data.regionId ? await prisma.region.findUnique({ where: { id: data.regionId } }) : null;
      changes.push(`Region changed to ${region?.name || 'None'}`);
    }

    // Check if stage changed to log activity
    if (existing.stageId !== data.stageId) {
      const oldStage = await prisma.pipelineStage.findUnique({ where: { id: existing.stageId } });
      const newStage = await prisma.pipelineStage.findUnique({ where: { id: data.stageId } });
      
      changes.push(`Stage changed from ${oldStage?.name} to ${newStage?.name}`);
      

      // TRIGGER ORDER WORKFLOW if Stage is "Won"
      if (newStage?.name.toLowerCase().includes('won')) {
        // Check if an order already exists for this lead
        const existingOrder = await prisma.order.findFirst({ where: { leadId: data.id } });
        
        if (!existingOrder) {
          // Check if New or Existing Customer
          const client = await prisma.client.findUnique({
            where: { id: existing.clientId },
            include: { clientMappings: true, orders: true }
          });

          // A customer is "Existing" if they have an ERP mapping or previous orders
          const isExisting = (client?.clientMappings && client.clientMappings.length > 0) || (client?.orders && client.orders.length > 0);
          
          const newOrderStatus = isExisting ? "PENDING_DISPATCH_REVIEW" : "PENDING_ACCOUNT_CREATION";

          const newOrder = await prisma.order.create({
            data: {
              totalAmount: existing.expectedValue || 0,
              status: newOrderStatus,
              leadId: data.id,
              clientId: existing.clientId,
              assignedToId: existing.assignedToId,
              createdById: user.id,
              updatedById: user.id,
            }
          });

          await prisma.activity.create({
            data: {
              type: ActivityType.TASK,
              description: `Order ${newOrder.orderNumber} auto-created. Customer routed to ${isExisting ? 'Existing' : 'New'} workflow (${newOrderStatus}).`,
              leadId: data.id,
              orderId: newOrder.id,
              createdById: user.id,
            }
          });
        }
      }
    }

    if (changes.length > 0) {
      await prisma.activity.create({
        data: {
          type: "NOTE",
          description: `Updated fields:\n- ${changes.join('\n- ')}`,
          leadId: data.id,
          createdById: user.id,
        }
      });
    }

    const { id, ...updateData } = result.data;
    
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...updateData,
        expectedClosingDate: updateData.expectedClosingDate ? new Date(updateData.expectedClosingDate) : null,
        updatedById: user.id,
      },
    });

    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return { success: true, lead };
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return { error: "Failed to update lead" };
  }
}

export async function updateLeadStage(id: string, stageId: string) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS") {
    return { error: "Unauthorized to edit leads" };
  }

  try {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return { error: "Lead not found" };
    
    // RBAC
    if (user.role === "REGIONAL_MANAGER" && existing.regionId !== user.regionId) return { error: "Unauthorized" };
    if (user.role === "SALES_EXECUTIVE" && existing.assignedToId !== user.id) return { error: "Unauthorized" };

    if (existing.stageId === stageId) return { success: true, lead: existing };

    const oldStage = await prisma.pipelineStage.findUnique({ where: { id: existing.stageId } });
    const newStage = await prisma.pipelineStage.findUnique({ where: { id: stageId } });

    // Activity log
    await prisma.activity.create({
      data: {
        type: "NOTE",
        description: `Stage changed from ${oldStage?.name} to ${newStage?.name} via Kanban`,
        leadId: id,
        createdById: user.id,
      }
    });

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        stageId,
        updatedById: user.id,
      },
    });

    revalidatePath("/leads");
    return { success: true, lead };
  } catch (error: any) {
    console.error("Error updating lead stage:", error);
    return { error: "Failed to update lead stage" };
  }
}

export async function deleteLead(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS") {
    return { error: "Unauthorized to delete leads" };
  }

  try {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return { error: "Lead not found" };
    if (user.role === "REGIONAL_MANAGER" && existing.regionId !== user.regionId) {
      return { error: "Unauthorized" };
    }
    if (user.role === "SALES_EXECUTIVE" && existing.assignedToId !== user.id) {
      return { error: "Unauthorized" };
    }

    await prisma.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: user.id,
      },
    });

    revalidatePath("/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    return { error: "Failed to delete lead" };
  }
}

export async function addLeadActivity(leadId: string, description: string, type: ActivityType = "NOTE", fileUrl?: string, fileName?: string) {
  const user = await getCurrentUser();
  if (!user || user.role === "DISPATCH" || user.role === "ACCOUNTS") {
    return { error: "Unauthorized to add activities" };
  }

  try {
    const activity = await prisma.activity.create({
      data: {
        type,
        description,
        leadId,
        createdById: user.id,
      }
    });

    if (fileUrl && fileName) {
      await prisma.attachment.create({
        data: {
          fileName,
          fileUrl,
          activityId: activity.id
        }
      });
    }

    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error adding activity:", error);
    return { error: "Failed to add activity" };
  }
}

export async function getPipelineStages() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.pipelineStage.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' }
  });
}
