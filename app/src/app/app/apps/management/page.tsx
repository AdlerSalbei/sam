import { ExternalApps } from "@/modules/apps/components/ExternalApps";
import { getAppTags, getExternalApps } from "@/modules/apps/queries";
import { requireAuthenticationPage } from "@/modules/auth/server";

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/apps/management",
  );
  await authentication.authorizePage("apps", "manage");

  const [rows, availableTags] = await Promise.all([
    getExternalApps(),
    getAppTags(),
  ]);

  return <ExternalApps existingApps={rows} availableTags={availableTags} />;
}
