"use server";

import { prisma } from "@/db";
import { requireAuthenticationAction } from "@/modules/auth/server";
import { log } from "@/modules/logging";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  id: z.cuid2().optional(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .transform((value) => value.replaceAll(" ", "")),
  description: z.string().max(512),
  icon: z.string().max(512).optional(),
  imageSrc: z.string().max(512).optional(),
  tags: z.string().transform((val) => JSON.parse(val) as string[]),
  // Team selection stores citizen IDs. Citizens (Entity.id) use plain cuid(),
  // not cuid(2) - only ExternalApps.id itself is cuid(2).
  team: z.array(z.string().trim().cuid()).max(50),
  url: z.httpUrl(),
});

export async function deleteExternalApp(id: string): Promise<void> {
  await prisma.ExternalApps.delete({ where: { id } });
}

export const registerExternalApp = async (formData: FormData) => {
  const t = await getTranslations();

  try {
    const authentication =
      await requireAuthenticationAction("handleExternalApp");
    await authentication.authorizeAction("update", "create", "delete");
    if (!authentication.session.entity)
      return {
        error: t("Common.forbidden"),
        requestPayload: formData,
      };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      id: formData.get("id") ?? undefined,
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description") ?? "",
      icon: formData.get("icon") || undefined,
      imageSrc: formData.get("imageSrc") || undefined,
      tags: formData.get("tags"),
      team: formData.getAll("team[]"),
      url: formData.get("url"),
    });
    if (!result.success)
      return {
        error: t("Common.badRequest"),
        errorDetails: result.error,
        requestPayload: formData,
      };

    const { id, ...data } = result.data;

    if (id) {
      await prisma.ExternalApps.update({
        where: { id },
        data,
      });
    } else {
      await prisma.ExternalApps.create({
        data,
      });
    }

    revalidatePath("/app/apps/management");

    return { success: t("Common.successfullySaved") };
  } catch (error) {
    unstable_rethrow(error);
    log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error: t("Common.internalServerError"),
      requestPayload: formData,
    };
  }
};
