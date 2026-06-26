# Cognito Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Azure AD NextAuth provider with AWS Cognito Hosted UI provider.

**Architecture:** Swap `AzureADProvider` for `CognitoProvider` in the single NextAuth route file. Update the login button component and its import in the login page. Everything downstream (session, AuthGuard, requireUser, API routes) is unchanged — all rely on `session.user.email` which Cognito supplies identically.

**Tech Stack:** NextAuth v4, `next-auth/providers/cognito` (already installed), lucide-react (already installed)

## Global Constraints

- Biome 2 enforces: double quotes, 2-space indent, trailing commas, semicolons always
- Import order: react > next > packages > `@/*` aliases > relative paths
- No CommonJS — ES modules only
- Line width: 120 characters

---

### Task 1: Swap NextAuth provider + update env vars

**Files:**
- Modify: `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `.env.local`
- Modify: `.env.example`

**Interfaces:**
- Produces: `authOptions` with `providers: [CognitoProvider(...)]` — consumed by `src/lib/auth.ts` and `src/app/(main)/auth/login/page.tsx` (unchanged imports)

- [ ] **Step 1: Update NextAuth route**

Replace the entire file content:

```ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: process.env.COGNITO_ISSUER,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

- [ ] **Step 2: Update .env.local**

Remove the three Azure lines, add three Cognito lines:

```
# Remove:
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=

# Add (fill in real values):
COGNITO_CLIENT_ID=<App Client ID from Cognito console>
COGNITO_CLIENT_SECRET=<App Client Secret from Cognito console>
COGNITO_ISSUER=https://cognito-idp.<region>.amazonaws.com/<userPoolId>
```

- [ ] **Step 3: Update .env.example**

Replace the file content:

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
KB_ID=
NEXTAUTH_SECRET=
COGNITO_CLIENT_ID=
COGNITO_CLIENT_SECRET=
COGNITO_ISSUER=
DATABASE_URL=
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors on `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/\[...nextauth\]/route.ts .env.example
git commit -m "feat: swap NextAuth provider from Azure AD to Cognito"
```

(Do not commit `.env.local` — it is gitignored.)

---

### Task 2: Update login UI

**Files:**
- Create: `src/app/(main)/auth/_components/social-auth/cognito-button.tsx`
- Delete: `src/app/(main)/auth/_components/social-auth/microsoft-button.tsx`
- Modify: `src/app/(main)/auth/login/page.tsx`

**Interfaces:**
- Consumes: `signIn` from `next-auth/react` — calls `signIn("cognito")` to trigger Cognito Hosted UI redirect
- Produces: `CognitoButton` component — same props interface as the old `MicrosoftButton`

- [ ] **Step 1: Create cognito-button.tsx**

```tsx
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
```

- [ ] **Step 2: Update login page**

Replace the entire file content:

```tsx
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
```

- [ ] **Step 3: Delete the old microsoft-button.tsx**

```bash
rm src/app/(main)/auth/_components/social-auth/microsoft-button.tsx
```

- [ ] **Step 4: Verify no remaining references to microsoft-button or AzureAD**

```bash
grep -r "microsoft-button\|AzureAD\|azure-ad\|AZURE_" src/ --include="*.ts" --include="*.tsx"
```

Expected: no output

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/app/(main)/auth/_components/social-auth/cognito-button.tsx \
        src/app/(main)/auth/login/page.tsx
git rm src/app/(main)/auth/_components/social-auth/microsoft-button.tsx
git commit -m "feat: replace Microsoft login button with Cognito SSO button"
```

---

## Post-Implementation Smoke Test

Once Cognito credentials are in `.env.local`, restart the dev server and verify:

1. `http://localhost:3000/auth/login` shows "Login with SSO" button
2. Clicking the button redirects to Cognito Hosted UI (`<your-domain>.auth.<region>.amazoncognito.com`)
3. After login, Cognito redirects to `http://localhost:3000/api/auth/callback/cognito`
4. App redirects to `/budget` and `useSession()` returns `status: "authenticated"`
