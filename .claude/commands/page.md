---
description: Create a new page route with layout and components
---

# Generate Page

Create a new page route for the X-Rovula application.

**Page description**: $ARGUMENTS

## Steps

1. Determine if this is a protected route (`(main)`) or public route (`(external)`)

2. Create the page structure:
   - `src/app/(main)/<name>/page.tsx` - Main page component (server component)
   - `src/app/(main)/<name>/layout.tsx` - Layout wrapper (if needed)
   - `src/app/(main)/<name>/_components/` - Feature-specific components

3. For CRUD pages, create:
   - `page.tsx` - List view
   - `create/page.tsx` - Create form
   - `[id]/page.tsx` - Detail view
   - `[id]/edit/page.tsx` - Edit form

4. Page conventions:
   - Server components by default
   - Fetch data in server components using Prisma directly or fetch API
   - Pass data to client components as props
   - Use Shadcn UI components for layout (Card, Table, Button, etc.)
   - Use `AuthGuard` wrapping if route requires authentication

5. Run `npm run check:fix` after creation
