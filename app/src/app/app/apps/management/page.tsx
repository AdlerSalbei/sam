import { requireAuthenticationPage } from "@/modules/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { type Metadata } from "next";
import { addExternalApp } from "@/modules/apps/components/externalApps";

export const metadata: Metadata = {
  title: "Apps Management",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/apps/management");
  await authentication.authorizePage("apps", "manage");

  return (
    <SuspenseWithErrorBoundaryTile>
      <addExternalApp/>
    </SuspenseWithErrorBoundaryTile>
  );
}