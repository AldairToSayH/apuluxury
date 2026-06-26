"use client";

import type { ReactNode } from "react";

import { SellerMobileMenu } from "@/components/seller/SellerMobileMenu";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { ProtectedPage } from "@/components/ui/ProtectedPage";

type SellerDashboardShellProps = {
  children: ReactNode;
};

export function SellerDashboardShell({ children }: SellerDashboardShellProps) {
  return (
    <ProtectedPage role="seller">
      {() => (
        <div className="min-h-screen bg-[linear-gradient(135deg,#f7f2ea_0%,#fbfaf7_44%,#efe4d4_100%)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl gap-6">
            <SellerSidebar />
            <main className="min-w-0 flex-1">
              <SellerMobileMenu />
              {children}
            </main>
          </div>
        </div>
      )}
    </ProtectedPage>
  );
}
