import { authenticate } from "@/modules/auth/server";
import { transformPermissionStringToPermissionSet } from "@/modules/auth/transformPermissionStringToPermissionSet";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { cache } from "react";
import { prisma } from "@/db";
import { INTEGRATED_APPS } from "./INTEGRATED_APPS";
import type { App, RedactedApp } from "./types";

/**
 * Retrieves all apps from static configuration and database. Then marks apps
 * as redacted when the user lacks the permissions to access them.
 */
export const getAppLinks = cache(
  withTrace("getAppLinks", async () => {
    const authentication = await authenticate();
    if (!authentication) return null;

    // Externe Apps aus der Datenbank laden
    const dbExternalApps = await prisma.externalApps.findMany({ include: { tags: true } });

    const apps: App[] = await Promise.all([
      ...INTEGRATED_APPS.map(async (app) => {
        let redacted = false;
        if (app.permissionStrings && app.permissionStrings.length > 0) {
          const permissions = await Promise.all(
            app.permissionStrings.map(async (permissionString) => {
              const permissionSet =
                transformPermissionStringToPermissionSet(permissionString);
              return authentication.authorize(
                permissionSet.resource,
                permissionSet.operation,
                permissionSet.attributes,
              );
            }),
          );
          if (!permissions.some((permission) => permission === true))
            redacted = true;
        }
        if (redacted) {
          return {
            name: app.name,
            tags: app.tags,
            redacted: true,
          } satisfies RedactedApp;
        }
        return {
          ...app,
        };
      }),
      // Externe Apps aus DB mappen (kein Permission-Check nötig laut TODO)
      ...dbExternalApps.map((externalApp) => ({
        ...externalApp,
        tags: externalApp.tags.map((t) => t.name),
      })),
    ]);

    return apps;
  }),
);

export const getExternalAppBySlug = cache(
  withTrace("getExternalApp", async (slug: string) => {
    const authentication = await authenticate();
    if (!authentication) return null;

    // App aus der Datenbank per Slug laden
    const app = await prisma.externalApps.findUnique({
      where: { slug },
    });

    if (!app) return null;
    return app;
  }),
);
