import { requireAuthenticationPage } from "@/modules/auth/server";
import { getExternalApps } from "@/modules/apps/queries";
import { ExternalApps} from "@/modules/apps/components/externalApps";

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/apps/management");
  await authentication.authorizePage("apps", "manage");

  const rows = await getExternalApps();

  return <ExternalApps existingApps={rows} />;
}