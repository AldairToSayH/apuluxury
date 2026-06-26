import type { ReactNode } from "react";

import { SellerDashboardShell } from "@/components/seller/SellerDashboardShell";

type SellerLayoutProps = {
  children: ReactNode;
};

export default function SellerLayout({ children }: SellerLayoutProps) {
  return <SellerDashboardShell>{children}</SellerDashboardShell>;
}
