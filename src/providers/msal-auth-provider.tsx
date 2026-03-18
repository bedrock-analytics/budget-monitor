"use client";

import { type ReactNode, use } from "react";

import type { AccountInfo, AuthenticationResult } from "@azure/msal-browser";
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

import { msalConfig } from "@/lib/msal/msal-config";

const msalInstance = typeof window !== "undefined" ? new PublicClientApplication(msalConfig) : null;

if (msalInstance) {
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && (event.payload as AuthenticationResult)?.account) {
      const account = (event.payload as AuthenticationResult).account as AccountInfo;
      msalInstance.setActiveAccount(account);
    }
  });
}

export const msalInstancePromise: Promise<PublicClientApplication | null> = msalInstance
  ? msalInstance.initialize().then(() => {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
        msalInstance.setActiveAccount(accounts[0]);
      }
      return msalInstance;
    })
  : Promise.resolve(null);

function MsalProviderInner({ children }: { children: ReactNode }) {
  const instance = use(msalInstancePromise);

  if (!instance) return <>{children}</>;

  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}

export function MsalAuthProvider({ children }: { children: ReactNode }) {
  return <MsalProviderInner>{children}</MsalProviderInner>;
}
