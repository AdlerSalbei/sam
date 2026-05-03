"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  id:          z.string().optional(),
  name:        z.string(),
  slug:        z.string(),
  description: z.string(),
  icon:        z.string(),
  imageSrc:    z.string(),
  tags:        z.string().transform((val) => JSON.parse(val) as string[]),
  url:         z.string(),
  team:        z.string(),
});

export const registerExternalApp = createAuthenticatedAction(schema, async (data) => {
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
});