# Auth: Azure AD → AWS Cognito

**Date:** 2026-06-26  
**Scope:** Swap NextAuth provider only — no changes to session model, guards, or API routes.

## What Changes

| File | Change |
|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | Replace `AzureADProvider` with `CognitoProvider` |
| `src/app/(main)/auth/_components/social-auth/microsoft-button.tsx` | Rename to `cognito-button.tsx`, call `signIn("cognito")` |
| `src/app/(main)/auth/login/page.tsx` | Import `CognitoButton`, update copy |
| `.env.local` | Replace Azure vars with Cognito vars |
| `.env.example` | Same |

## What Stays the Same

- `src/lib/auth.ts` — `requireUser()` reads `session.user.email`, unchanged
- `src/components/auth/auth-guard.tsx` — uses `useSession()`, unchanged
- `src/app/types/next-auth.d.ts` — `accessToken`/`idToken` fields still valid for Cognito
- All API routes — call `getServerSession(authOptions)`, unchanged

## Environment Variables

Remove:
```
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_TENANT_ID
```

Add:
```
COGNITO_CLIENT_ID=<App Client ID>
COGNITO_CLIENT_SECRET=<App Client Secret>
COGNITO_ISSUER=https://cognito-idp.{region}.amazonaws.com/{userPoolId}
```

## Auth Flow

1. User clicks "Login with Cognito" → `signIn("cognito")`
2. NextAuth redirects to Cognito Hosted UI
3. User authenticates on Cognito Hosted UI
4. Cognito redirects back with authorization code → NextAuth exchanges for tokens
5. `jwt` callback stores `accessToken` + `idToken` in JWT (same as before)
6. `session` callback exposes them to client (same as before)
7. `requireUser()` upserts User in DB by email (same as before)

## Cognito App Client Requirements

The Cognito App Client must have:
- **Allowed callback URL:** `http://localhost:3000/api/auth/callback/cognito` (dev) + production URL
- **Allowed sign-out URL:** `http://localhost:3000` (dev) + production URL
- **OAuth flows:** Authorization code grant
- **OAuth scopes:** `openid`, `email`, `profile`
- **App client secret:** enabled (required for NextAuth server-side flow)
