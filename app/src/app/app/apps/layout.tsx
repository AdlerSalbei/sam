import { getNavigationItems } from "@/modules/apps/utils/getNavigationItems";
import { DefaultLayout } from "@/modules/common/components/layouts/DefaultLayout";
import { MaxWidthContent } from "@/modules/common/components/layouts/MaxWidthContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s - Apps",
    default: "Apps",
  },
};

export default async function Layout({ children }: LayoutProps<"/app/apps">) {
  const pages = await getNavigationItems();
  return (
    <DefaultLayout title="Apps" pages={pages} slug="apps">
      <MaxWidthContent>{children}</MaxWidthContent>
    </DefaultLayout>
  );
}
