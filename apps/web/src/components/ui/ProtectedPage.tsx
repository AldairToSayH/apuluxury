"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser, redirectPathForUser } from "@/lib/auth";
import { routes } from "@/lib/routes";
import type { MeResponse, UserRole } from "@/types/api";

type ProtectedPageProps = {
  role: UserRole;
  children: (session: MeResponse) => React.ReactNode;
};

export function ProtectedPage({ role, children }: ProtectedPageProps) {
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((currentSession) => {
        if (!isMounted) {
          return;
        }

        if (!currentSession) {
          router.replace(routes.login);
          return;
        }

        if (currentSession.user.role !== role) {
          if (currentSession.user.role === "buyer" && role === "seller") {
            router.replace(routes.catalog);
            return;
          }

          router.replace(redirectPathForUser(currentSession.user));
          return;
        }

        setSession(currentSession);
      })
      .catch(() => {
        router.replace(routes.login);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [role, router]);

  if (isLoading || !session) {
    return (
      <section className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
        <div className="h-32 animate-pulse rounded-md bg-white shadow-soft" />
      </section>
    );
  }

  return <>{children(session)}</>;
}
