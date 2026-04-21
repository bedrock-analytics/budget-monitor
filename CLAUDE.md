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
- **Auth**: NextAuth v4 + Azure AD (JWT strategy, AuthGuard component)
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
      chat/            # AI chat with Bedrock
    api/               # REST API routes
      auth/            # NextAuth [...nextauth]
      chat/            # Bedrock AI chat
      chats/           # Chat CRUD + messages
      purchase-request/# PR CRUD
      booking-car/     # Booking CRUD + users + project-options
      budget/          # Budget data + options
      user/            # User profile
  components/
    ui/                # Shadcn UI components (excluded from Biome)
    sidebar/           # Sidebar navigation components
    auth/              # AuthGuard component
  hooks/               # Custom hooks (use-chat, use-message, use-mobile)
  lib/                 # Utilities (db, utils, fonts, preferences, domain helpers)
  providers/           # NextAuth session provider
  stores/              # Zustand stores (preferences)
  styles/              # TailwindCSS & theme presets
  server/              # Server actions (cookies, preferences)
  types/               # TypeScript type definitions
  config/              # App configuration
  data/                # Static data (users)
  scripts/             # Code generation scripts (theme presets, theme boot)
prisma/
  schema.prisma        # Database schema
deployments/           # K8s deployment configs (dev, qa, prod)
```

## Database Models

Key models: User, Chat, Message, Budget, PurchaseRequest, PurchaseRequestItem, CarBooking, CarBookingPassenger, CarBookingHotel, CarBookingFlight, CarBookingTrip

Enums: MessageRole, PurchaseRequestStatus, CarBookingStatus

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
- **Auth protection**: `AuthGuard` client component wraps protected routes; API routes use `getServerSession()`
- **API validation**: Zod schemas for request body validation in API routes
- **Database**: Singleton PrismaClient pattern with global caching for dev
- **ID generation**: PR numbers (PR-YYYYMM-XXXX), Booking numbers (CB-YYMM-XXXX)
- **Path alias**: `@/*` maps to `./src/*`
- **Utilities**: `cn()` for class merging (clsx + tailwind-merge), currency formatters in `src/lib/utils.ts`
- **Preferences**: Zustand store + cookies for theme/layout persistence
