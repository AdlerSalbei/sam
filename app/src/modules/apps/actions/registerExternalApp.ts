"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id:          z.cuid2().optional(),
  name:        z.string().min(1).max(255),
  slug:        z.string(),
  description: z.string().min(1),
  icon:        z.string().optional(),
  imageSrc:    z.string().optional(),
  tags:        z.string().transform((val) => JSON.parse(val) as string[]),
  team:        z.string().transform((val) => JSON.parse(val) as string[]),
  url:         z.httpUrl(),
});

export const registerExternalApp = createAuthenticatedAction(
  "registerExternalApp",
  schema,
  async (_formData, _authentication, data) => {
    const { id, ...fields } = data;

    await prisma.ExternalApps.upsert({
      where: { id || 00000000-0000-0000-0000-000000000000},
      update: { data: fields },
      create: { data: data },
    });
    
    revalidatePath("/app/apps/management");

    return { success: "App saved successfully" };  
  },
);
