import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { forbidden } from "next/navigation";
import { cache } from "react";

export const getExternalApps = cache(
  withTrace("getExternalApps", async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("apps", "manage"))) forbidden();

    return prisma.externalApps.findMany({ include: { tags: true } });
  }),
);

export const getAppTags = cache(
  withTrace("getAppTags", async () => {
    return prisma.appTag.findMany({ orderBy: { name: "asc" } });
  }),
);