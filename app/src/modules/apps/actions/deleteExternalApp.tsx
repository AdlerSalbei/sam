"use server";

import { prisma } from "@/db";

export async function deleteExternalApp (id: string): Promise<void> {
  await prisma.ExternalApps.delete({ where: { id } });
}
