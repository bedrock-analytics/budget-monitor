---
description: Review code changes for quality, security, and conventions
---

# Code Review

Review the current code changes in this branch for quality, security, and adherence to project conventions.

## Review Checklist

1. **Check changes**: Run `git diff` and `git diff --staged` to see all modifications

2. **Code style**:
   - Biome rules followed (double quotes, semicolons, trailing commas, self-closing elements)
   - Import order correct (react > next > packages > @/ aliases > relative)
   - Line width within 120 characters
   - No CommonJS patterns

3. **Security**:
   - No hardcoded secrets or credentials
   - API routes check authentication with `getServerSession()`
   - Input validation with Zod on all API endpoints
   - No SQL injection risks (using Prisma parameterized queries)
   - No XSS vulnerabilities in rendered content
   - No sensitive data in client-side code

4. **TypeScript**:
   - Proper types used (no `any` unless justified)
   - Zod schemas align with TypeScript types
   - Prisma types used correctly

5. **React/Next.js**:
   - `"use client"` directive only where needed
   - Server components used by default
   - No unnecessary re-renders (proper dependency arrays)
   - Proper error handling and loading states

6. **Database**:
   - Efficient queries (proper includes, selects)
   - Indexes on frequently queried fields
   - Proper cascade deletes on relations

7. **Conventions**:
   - Colocated feature structure followed
   - Shadcn UI components used appropriately
   - State management patterns consistent (Zustand for UI, React Query for server)

8. Run `npm run check` to verify Biome passes

Report findings with severity (critical, warning, suggestion) and specific file:line references.
