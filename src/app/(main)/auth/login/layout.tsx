import type { ReactNode } from "react";

import Image from "next/image";

import LogoImage from "@/lib/images/logo.png";
import SmartPlatformImage from "@/lib/images/smart-platform.webp";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main>
      <div className="grid h-dvh justify-center p-2 lg:grid-cols-2">
        <div className="relative order-2 hidden h-full rounded-3xl lg:flex">
          <Image
            src={SmartPlatformImage}
            alt="Bedrock Analytics"
            aria-hidden="true"
            className="w-full rounded-3xl object-cover"
          />
          <div className="absolute top-10 space-y-1 px-10 text-primary-foreground">
            <Image
              src={LogoImage}
              alt="Bedrock Analytics"
              aria-hidden="true"
              className="corner-round h-12 w-full object-cover"
            />
          </div>
        </div>
        <div className="relative order-1 flex h-full">{children}</div>
      </div>
    </main>
  );
}
