import { z } from "zod";

export const leadSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is required"),
  expectedValue: z.number().min(0, "Expected value must be positive").optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  source: z.enum(["WEBSITE", "REFERRAL", "COLD_CALL", "EXISTING_CLIENT", "OTHER"]).default("OTHER"),
  expectedClosingDate: z.date().optional().nullable(),
  description: z.string().optional().nullable(),
  clientId: z.string().min(1, "Client is required"),
  assignedToId: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
  stageId: z.string().min(1, "Pipeline stage is required"),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
