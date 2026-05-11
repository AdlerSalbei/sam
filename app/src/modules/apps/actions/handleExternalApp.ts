"use server";

import { prisma } from "@/db";
import { requireAuthenticationAction } from "@/modules/auth/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

const schema = z.object({
  id:          z.cuid2().optional(),
  name:        z.string().min(1).max(255),
  slug:        z.string().min(1).max(255).transform(value => value.replaceAll(" ", "")),
  description: z.string().max(512),
  icon:        z.string().max(512).optional(),
  imageSrc:    z.string().max(512).optional(),
  tags:        z.string().transform((val) => JSON.parse(val) as string[]),
  team:        z.string().transform((val) => JSON.parse(val) as string[]),
  url:         z.httpUrl(),
});

export async function deleteExternalApp (id: string): Promise<void> {
  await prisma.ExternalApps.delete({ where: { id } });
}

export const registerExternalApp = async (formData: FormData) => {
  const t = await getTranslations();

  try {
    const authentication = await requireAuthenticationAction(
      "handleExternalApp",
    );
    await authentication.authorizeAction(
      "update",
      "create",
      "delete",
    );
    if (!authentication.session.entity) return {
      error: t("Common.forbidden"),
      requestPayload: formData,
    };

    /**
     * Validate the request
     */
    const result = schema.safeParse({
      receiverIds: formData.getAll("receiverId[]"),
      value: formData.get("value"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
    });
    if (!result.success) return {
      error: t("Common.badRequest"),
      errorDetails: result.error,
      requestPayload: formData,
    };

    const { id, ...fields } = formData

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

  } catch (error) {
    unstable_rethrow(error);
    log.error("Internal Server Error", { error: serializeError(error) });
    return {
      error: t("Common.internalServerError"),
      requestPayload: formData,
    };
  }
};


