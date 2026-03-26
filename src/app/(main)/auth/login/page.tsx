import { redirect } from "next/navigation";

import { Globe } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { APP_CONFIG } from "@/config/app-config";

import { MicrosoftButton } from "../_components/social-auth/microsoft-button";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/budget");
  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-3xl">Login to your account</h1>
          <p className="text-muted-foreground text-sm">
            Please sign in with your Microsoft account to continue.
          </p>
        </div>
        <MicrosoftButton className="w-full" />
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="size-4 text-muted-foreground" />
          ENG
        </div>
      </div>
    </>
  );
}
