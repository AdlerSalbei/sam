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
  slug: z.string().min(1).max(255).transform((value) => value.replaceAll(" ", "")),
  description: z.string().max(512),
  icon: z.string().max(512).optional(),
  imageSrc: z.string().max(512).optional(),
  tagIds: z.array(z.string().min(1)).max(50).default([]),
  team: z.array(z.string().trim().cuid()).max(50),
  url: z.httpUrl(),
});

export async function deleteExternalApp(id: string): Promise<void> {
  await prisma.externalApps.delete({ where: { id } });
}

export const registerExternalApp = async (formData: FormData) => {
  const t = await getTranslations();

  try {
    const authentication =
      await requireAuthenticationAction("handleExternalApp");
    await authentication.authorizeAction("apps", "manage");
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
      tagIds: formData.getAll("tagIds[]"),
      team: formData.getAll("team[]"),
      url: formData.get("url"),
    });
    if (!result.success)
      return {
        error: t("Common.badRequest"),
        errorDetails: result.error,
        requestPayload: formData,
      };

    const { id, tagIds, ...data } = result.data;

    if (id) {
      await prisma.externalApps.update({
        where: { id },
        data: { ...data, tags: { set: tagIds.map((tid) => ({ id: tid })) } },
      });
    } else {
      await prisma.externalApps.create({
        data: { ...data, tags: { connect: tagIds.map((tid) => ({ id: tid })) } },
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