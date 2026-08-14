"use server";

import { prisma } from "@/db";
import { requireAuthenticationAction } from "@/modules/auth/server";
import { log } from "@/modules/logging";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { serializeError } from "serialize-error";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(64).trim(),
});

export const createAppTag = async (
  formData: FormData,
): Promise<{ tag?: { id: string; name: string }; error?: string }> => {
  try {
    const authentication = await requireAuthenticationAction("createAppTag");
    await authentication.authorizeAction("apps", "manage");

    const result = schema.safeParse({ name: formData.get("name") });
    if (!result.success) return { error: "Ungültiger Tag-Name." };

    const tag = await prisma.appTag.upsert({
      where: { name: result.data.name },
      update: {},
      create: { name: result.data.name },
    });

    revalidatePath("/app/apps/management");
    return { tag };
  } catch (error) {
    unstable_rethrow(error);
    log.error("Internal Server Error", { error: serializeError(error) });
    return { error: "Interner Fehler." };
  }
};
