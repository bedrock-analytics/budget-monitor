"use client";

import Image from "next/image";

import { useMsal } from "@azure/msal-react";

import { Button } from "@/components/ui/button";
import microsoftIcon from "@/lib/images/svg/microsoft.svg";
import { loginRequest } from "@/lib/msal/msal-config";
import { cn } from "@/lib/utils";

function MicrosoftIcon({ className }: { className?: string }) {
  return <Image src={microsoftIcon} alt="Microsoft" className={className} aria-hidden="true" />;
}

export function MicrosoftButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({ ...loginRequest, prompt: "login" }).catch((error) => {
      console.error("Microsoft login failed:", error);
    });
  };

  return (
    <Button variant="secondary" className={cn(className)} onClick={handleLogin} {...props}>
      <MicrosoftIcon className="size-4" />
      Login with Microsoft
    </Button>
  );
}
