"use client";

import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CognitoButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="secondary" className={cn(className)} onClick={() => signIn("cognito")} {...props}>
      <LogIn className="size-4" />
      Login with SSO
    </Button>
  );
}
