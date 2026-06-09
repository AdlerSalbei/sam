import { authenticate } from "@/modules/auth/server";
import type { Page } from "@/modules/common/components/layouts/DefaultLayout/Navigation";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const permissions = await Promise.all([
    authentication.authorize("orgFleet", "read"),
  ]);

  const pages: Page[] = [];

  if (permissions[0]) {
    pages.push({
      title: "Management",
      url: "/app/apps/management",
    });
  }

  return pages;
};
