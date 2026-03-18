import type { Configuration } from "@azure/msal-browser";

const getRedirectUri = () => {
  if (process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback/microsoft`;
  }

  return "http://localhost/auth/callback/microsoft";
};

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? "",
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? ""}`,
    redirectUri: getRedirectUri(),
    navigateToLoginRequestUrl: false,
    postLogoutRedirectUri: "/auth/logout",
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};
