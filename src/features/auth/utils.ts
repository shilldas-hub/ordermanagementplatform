import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    return null;
  }

  // Fetch the full user from our Prisma DB using the email from Supabase
  let dbUser = await prisma.user.findUnique({
    where: { email: authUser.email },
  });

  // Since this is a CRM and users are manually provisioned,
  // typically the user must already exist in Prisma.
  // For development ease, if they don't exist, we'll sync them automatically
  // as a fallback (assuming they successfully signed up via Supabase)
  if (!dbUser && authUser.email) {
    dbUser = await prisma.user.create({
      data: {
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        role: Role.SALES_EXECUTIVE, // default fallback role
      },
    });
  }

  return dbUser;
});
