import { z } from 'zod';

export const clientSchema = z.object({
  id: z.string().uuid().optional(),
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  gstNumber: z.string().optional().or(z.literal("")),
  address: z.string().optional(),
  regionId: z.string().uuid("Region is required").optional().or(z.literal("")),

  status: z.enum(["ACTIVE", "INACTIVE", "BLACKLISTED"]).default("ACTIVE"),
  assignedToId: z.string().uuid().optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
