# CLAUDE.md

## Project Overview

X-Rovula: Enterprise dashboard application (Next.js 16 App Router + TypeScript) for managing dashboards, AI chat, purchase requests, budgets, and car bookings.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5.9
- **Styling**: TailwindCSS 4, Shadcn UI, Radix UI
- **State**: Zustand, TanStack React Query, TanStack React Table
- **Forms**: React Hook Form + Zod validation
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth + Azure AD (MSAL)
- **AI**: AWS Bedrock Agent
- **Linter/Formatter**: Biome 2

## Commands

```bash
npm run dev              # Start dev server on port 3030
npm run build            # Production build
npm run lint             # Biome lint
npm run format           # Biome format (--write)
npm run check            # Biome check (lint + format)
npm run check:fix        # Biome check with auto-fix
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run Prisma migrations
npm run prisma:studio    # Open Prisma Studio
```

## Project Structure

```
src/
  app/
    (external)/        # Public/landing pages
    (main)/            # Protected routes (dashboard, booking-car, budget, chat, purchase)
    api/               # API routes
  components/          # Shared UI components (includes shadcn/ui)
  hooks/               # Custom React hooks
  lib/                 # Utilities & config
  providers/           # Context providers
  stores/              # Zustand stores
  styles/              # TailwindCSS & theme presets
  server/              # Server utilities
  types/               # TypeScript type definitions
```

## Code Style (Biome)

- **Indent**: 2 spaces
- **Line width**: 120 characters
- **Quotes**: Double quotes
- **Semicolons**: Always
- **Trailing commas**: All
- **Self-closing elements**: Required
- **Import order**: react > next > packages > aliases > relative paths (enforced by Biome organizeImports)
- **No CommonJS**: Use ES modules only
- **Sorted Tailwind classes**: Enforced via `useSortedClasses`

## Pre-commit

Husky + lint-staged runs `biome check` on staged `*.{js,ts,jsx,tsx}` files before every commit.

## Conventions

- Colocated feature structure: each route owns its `_components/`, logic, and types
- Shadcn UI components live in `src/components/ui` (excluded from Biome linting)
- Use `"use client"` directive for client components
- Server components are the default in App Router