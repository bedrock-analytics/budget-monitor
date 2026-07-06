# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


## Project Overview

X-Rovula: Enterprise dashboard application (Next.js 16 App Router + TypeScript) for Subsea IRM in Oil and Gas industry. Manages dashboards, AI chat (AWS Bedrock), purchase requests, budgets, and car bookings.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.9
- **Styling**: TailwindCSS 4, Shadcn UI, Radix UI
- **State**: Zustand (UI state), TanStack React Query (server state), TanStack React Table
- **Forms**: React Hook Form + Zod validation
- **Database**: PostgreSQL via Prisma ORM (singleton client in `src/lib/db.ts`)
- **Auth**: NextAuth v4 + AWS Cognito (JWT strategy, role-based authorization, AuthGuard component)
- **AI**: AWS Bedrock Agent (Knowledge Base RAG)
- **Linter/Formatter**: Biome 2
- **Deployment**: Kubernetes on AWS EKS with ECR

## Commands

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run build:local      # Build with local env
npm run build:dev        # Build with dev env
npm run build:qa         # Build with qa env
npm run build:prod       # Build with prod env
npm run lint             # Biome lint
npm run format           # Biome format (--write)
npm run check            # Biome check (lint + format)
npm run check:fix        # Biome check with auto-fix
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run Prisma migrations
npm run prisma:studio    # Open Prisma Studio
npm run generate:presets # Generate theme presets
```

## Project Structure

```
src/
  app/
    (external)/        # Public/landing pages
    (main)/            # Protected routes (dashboard, booking-car, budget, chat, purchase, auth)
      auth/            # Login, register, logout, callback
      dashboard/       # Main dashboard with sub-pages (default, crm, finance, analytics)
      purchase/        # Purchase request CRUD
      booking-car/     # Car booking CRUD
      budget/          # Budget management
      project/         # Cost tracking dashboards
      chat/            # AI chat with Bedrock
      admin/           # Menu Access console (ADMIN only)
      data-management/ # Dataset registry console (MANAGER+; Clear is ADMIN only)
    api/               # REST API routes
      auth/            # NextAuth [...nextauth]
      admin/           # Menu-access admin console + data registry (menu-access, data)
      chat/            # Bedrock AI chat
      chats/           # Chat CRUD + messages
      purchase-request/# PR CRUD
      booking-car/     # Booking CRUD + users + project-options
      budget/          # Budget data + options
      budget-detail/   # Budget line-item detail
      cost-tracking/   # Cost tracking projects + activities
      user/            # User profile + allowed-menus
      users/           # User list + activity summary (MANAGER+)
  components/
    ui/                # Shadcn UI components (excluded from Biome)
    sidebar/           # Sidebar navigation components
    auth/              # AuthGuard component
  hooks/               # Custom hooks (use-chat, use-message, use-allowed-menus, use-mobile)
  lib/                 # Utilities (db, utils, fonts, preferences, domain helpers)
    auth.ts            # resolveUser()/requireUser() -- session + user upsert on first login
    authz.ts           # requireRole/requireAdmin/hasRole/assertOwnership -- role-based authz
    admin.ts           # isAdmin() (role === ADMIN)
    rate-limit.ts      # lightweight in-memory rate limiting (chat + import endpoints)
    data-registry/     # DatasetProvider interface + registry powering the Data Management console
  navigation/sidebar/  # sidebar-items.ts (nav config) + access.ts (menu ACL: hasMenuAccess/isPathAllowed)
  providers/           # NextAuth session provider
  stores/              # Zustand stores (preferences)
  styles/              # TailwindCSS & theme presets
  server/              # Server actions (cookies, preferences)
  types/               # TypeScript type definitions
  config/              # App configuration
  data/                # Static mock data (users) -- still wired into AccountSwitcher's avatar; not the real session
  scripts/             # Code generation scripts (theme presets, theme boot)
proxy.ts               # Next.js 16's proxy (successor to middleware.ts): blanket authn gate on
                        # /api/* and protected page trees, plus page-level admin/manager role
                        # gates for /admin/* and /data-management/* (kept out of layouts --
                        # nested layouts and children render in parallel in the App Router, so a
                        # redirect() in a layout can lose the race against its child page)
prisma/
  schema.prisma        # Database schema
deployments/           # K8s deployment configs (dev, qa, prod)
```

## Database Models

Key models: User (role, isActive, allowedMenus), AuditLog, Chat, Message, Budget, BudgetDetail, CostTrackingProject, CostTrackingActivity, PurchaseRequest, PurchaseRequestItem, CarBooking, CarBookingPassenger, CarBookingHotel, CarBookingFlight, CarBookingTrip, FacilityQualityInspection, FacilityQualityInspectionItem

Enums: UserRole (ADMIN/MANAGER/USER), MessageRole, PurchaseRequestStatus, CarBookingStatus, InspectionStatus, InspectionResult, InspectionItemResult

## Authorization

- **Roles**: `UserRole` enum on `User.role` -- `ADMIN` > `MANAGER` > `USER`, ranked in `src/lib/authz.ts`. `hasRole(user, min)` checks the requester meets a minimum rank; `isAdmin(user)` (`src/lib/admin.ts`) checks `role === "ADMIN"` exactly.
- **Route guards** (`src/lib/authz.ts`): `requireUser()` (401 unauthenticated / 403 "Account deactivated"), `requireRole(min)`, `requireAdmin()`. Each returns `{ user } | NextResponse` -- routes check `if (auth instanceof NextResponse) return auth;` before destructuring `user`. `assertOwnership(resourceUserId, user)` allows the resource owner or any MANAGER+.
- **`src/proxy.ts`** (Next.js 16's successor to `middleware.ts`) is the first gate: rejects any `/api/*` request without a valid session (401) or redirects unauthenticated page requests to `/auth/login`; rejects a deactivated account's request everywhere (403 for API, redirect to `/unauthorized` for pages) before any route handler runs; and gates `/admin/*` (ADMIN only) and `/data-management/*` (MANAGER+) page trees.
- **Menu ACL** (`src/navigation/sidebar/access.ts`): sidebar items marked `restricted: true` are hidden unless the user's `allowedMenus` includes that item's `key`, or the user is an admin (short-circuits everything). `/api/user/allowed-menus` is the single source of truth the client reads from; it also injects the `data-management` key for any MANAGER+ so the sidebar stays consistent with the proxy gate without a DB-stored grant.
- **Admin bootstrap**: `ADMIN_BOOTSTRAP_EMAILS` (comma-separated) in the environment; `npm run db:seed` (`prisma/seed.ts`) sets `role=ADMIN` for those emails. The last active ADMIN cannot be demoted or deactivated via the admin console (`/admin/menu-access`) -- guarded server-side in `PUT /api/admin/menu-access`.
- **Data import** (`budget`, `budget-detail`, `cost-tracking`, and any dataset registered in `src/lib/data-registry/`): import POSTs require MANAGER; `mode=replace` (wipe-then-reload) and dataset `clear` both require ADMIN. `?dryRun=1` parses and validates without writing, returning row counts/errors for a client-side preview before commit. Every commit writes the row data and an `AuditLog` row in the same transaction (not two separate writes) so the audit trail can't drift from the data.

## Rate Limiting

`src/lib/rate-limit.ts` provides a lightweight in-memory limiter (per-user key, fixed window) applied to `chat` POST and every import endpoint. In-memory only -- resets on restart, doesn't coordinate across multiple instances/replicas. Fine at this app's current scale; move to a shared store (Redis) if horizontally scaled.

## Code Style (Biome)

- **Indent**: 2 spaces
- **Line width**: 120 characters
- **Quotes**: Double quotes
- **Semicolons**: Always
- **Trailing commas**: All
- **Self-closing elements**: Required
- **Bracket same line**: false
- **Line ending**: lf
- **Import order**: react > next > packages > aliases (@/*) > relative paths (enforced by Biome organizeImports)
- **No CommonJS**: Use ES modules only
- **Sorted Tailwind classes**: Enforced via `useSortedClasses`

## Pre-commit

Husky + lint-staged runs `biome check` on staged `*.{js,ts,jsx,tsx}` files before every commit.

## Conventions

- **Colocated features**: Each route owns its `_components/`, logic, and types
- **Shadcn UI**: Components live in `src/components/ui` (excluded from Biome linting)
- **Client components**: Use `"use client"` directive explicitly
- **Server components**: Default in App Router (no directive needed)
- **Auth protection**: `src/proxy.ts` gates every request first (see Authorization); `AuthGuard` client component additionally hides restricted pages client-side; API routes call `requireUser`/`requireRole`/`requireAdmin` from `src/lib/authz.ts`
- **API validation**: Zod schemas for request body validation in API routes
- **Database**: Singleton PrismaClient pattern with global caching for dev
- **ID generation**: PR numbers (PR-YYYYMM-XXXX), Booking numbers (CB-YYMM-XXXX)
- **Path alias**: `@/*` maps to `./src/*`
- **Utilities**: `cn()` for class merging (clsx + tailwind-merge), currency formatters in `src/lib/utils.ts`
- **Preferences**: Zustand store + cookies for theme/layout persistence
