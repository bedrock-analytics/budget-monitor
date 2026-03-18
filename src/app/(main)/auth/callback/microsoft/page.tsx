"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import type { PublicClientApplication } from "@azure/msal-browser";

import { setClientCookie } from "@/lib/cookie.client";
import { msalInstancePromise } from "@/providers/msal-auth-provider";

export default function MicrosoftCallbackPage() {
  const router = useRouter();
  const handled = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    msalInstancePromise
      .then((inst) => {
        setInstance(inst);
      })
      .catch((err) => {
        console.error("[callback] msalInstancePromise rejected:", err);
      });
  }, []);

  useEffect(() => {
    if (!instance || handled.current) return;
    handled.current = true;

    instance
      .handleRedirectPromise()
      .then((result) => {
        const account = result?.account ?? instance.getActiveAccount();
        const idToken = result?.idToken ?? account?.idToken;

        if (idToken) {
          setClientCookie("accessToken", idToken);
          if (account) instance.setActiveAccount(account);
          router.replace("/dashboard/default");
        } else {
          setError("Token not found. Please try again.");
          router.replace("/auth/login");
        }
      })
      .catch((err) => {
        console.error("[callback] handleRedirectPromise error:", err);
        setError(err?.message ?? "An error occurred. Please try again.");
        router.replace("/auth/login");
      });
  }, [instance, router]);

  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">{error ?? "Signing you in..."}</p>
      </div>
    </div>
  );
}
