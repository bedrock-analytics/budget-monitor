"use client";

import Image from "next/image";

import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import microsoftIcon from "@/lib/images/svg/microsoft.svg";
import { cn } from "@/lib/utils";

function MicrosoftIcon({ className }: { className?: string }) {
  return <Image src={microsoftIcon} alt="Microsoft" className={className} aria-hidden="true" />;
}

export function MicrosoftButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    // <Button variant="secondary" className={cn(className)} onClick={handleLogin} {...props}>
    <Button variant="secondary" className={cn(className)} onClick={() => signIn("microsoft")} {...props}>
      <MicrosoftIcon className="size-4" />
      Login with Microsoft
    </Button>
  );
}
