"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id:          z.cuid2().optional(),
  name:        z.string().min(1).max(255),
  slug:        z.string().min(1).max(255).transform(value => value.replaceAll(" ", "")),
  description: z.string().min(1).max(4096),
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

  if (id) {
    await prisma.ExternalApps.update({
      where: { id },
      data: fields,
    });
  } else {
    await prisma.ExternalApps.create({
      data: fields,
    });
  }
    
    revalidatePath("/app/apps/management");

    return { success: "App saved successfully" };  
  },
);
