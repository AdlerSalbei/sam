/*
import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { forbidden } from "next/navigation";
import { cache } from "react";

export const getExternalApps = cache(
  withTrace("getExternalApps", async (id: Event["id"]) => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("apps", "manage"))) forbidden();

    const rows = await prisma.externalApps.findMany({
      
      });
  }),
);
*/