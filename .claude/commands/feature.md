---
description: Scaffold a new feature route with page, layout, API route, and components
---

# Generate Feature

Create a new feature for the X-Rovula application. The user will describe what feature they want.

**Feature request**: $ARGUMENTS

## Steps

1. **Analyze the request** - Understand what the feature needs (pages, API, database models, components)

2. **Database schema** (if needed):
   - Add new models/enums to `prisma/schema.prisma` following existing patterns
   - Use cuid() for IDs, include createdAt/updatedAt timestamps
   - Add appropriate indexes and relations
   - Run `npx prisma format` after changes

3. **API route** (if needed):
   - Create route handler in `src/app/api/<feature>/route.ts`
   - Use Zod for request validation
   - Use `getServerSession()` for auth
   - Use `NextResponse.json()` for responses
   - Follow existing patterns from purchase-request or booking-car APIs

4. **Page route**:
   - Create under `src/app/(main)/<feature>/`
   - Add `page.tsx` (server component by default)
   - Add `layout.tsx` if needed
   - Create `_components/` folder for feature-specific components
   - Add dynamic routes `[id]/` for detail pages if needed
   - Add `create/` and `[id]/edit/` routes for CRUD features

5. **Components**:
   - Create in `src/app/(main)/<feature>/_components/`
   - Use Shadcn UI components from `@/components/ui`
   - Use React Hook Form + Zod for forms
   - Use TanStack React Table for data tables
   - Mark client components with `"use client"`

6. **Hooks** (if needed):
   - Add custom hooks in `src/hooks/`
   - Use TanStack React Query for data fetching

7. **Navigation**:
   - Update sidebar navigation in `src/components/sidebar/nav-main.tsx` or relevant nav component

8. **Final checks**:
   - Run `npm run check:fix` to fix lint/format issues
   - Ensure all imports follow the Biome import order (react > next > packages > @/ aliases > relative)
   - Use double quotes, semicolons, trailing commas
