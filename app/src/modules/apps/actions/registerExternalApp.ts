"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  slug: z.string(),
  icon: z.string(),
  imageSrc: z.string(),
  tags: z.string(),
  url: z.string()
});

export const registerExternalApp = createAuthenticatedAction(
  "registerExternalApp",
  schema,
  async (formData, authentication, data, t) => {
    /**
     * Authorize the request
     */
    if (!authentication.session.entity)
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    const externalApps = await prisma.externalApps.upsert({
      where: {
        slug: data.externalApps.slug,
      },
      update: {
        name: data.externalApps.name,
        icon: data.externalApps.icon,
        imageSrc: data.externalApps.imageSrc,
        tags: data.externalApps.tags,
        url: data.externalApps.url,
      },
      create: {
        name: data.externalApps.name,
        icon: data.externalApps.icon,
        imageSrc: data.externalApps.imageSrc,
        tags: data.externalApps.tags,
        url: data.externalApps.url,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/app/apps/management");
    
    return {
      success: t("Common.successfullySaved"),
    };
  },
);