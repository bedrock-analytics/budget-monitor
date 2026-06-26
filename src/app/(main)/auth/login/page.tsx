import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { APP_CONFIG } from "@/config/app-config";

import { CognitoButton } from "../_components/social-auth/cognito-button";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/budget");
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Login to your account</h1>
          <p className="text-muted-foreground text-sm">Please sign in with your SSO account to continue.</p>
        </div>
        <CognitoButton className="w-full" />
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-4">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
      </div>
    </>
  );
}
