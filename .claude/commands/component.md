---
description: Create a new React component following project conventions
---

# Generate Component

Create a new React component for the X-Rovula application.

**Component description**: $ARGUMENTS

## Guidelines

1. **Determine location**:
   - Shared/reusable components: `src/components/<name>.tsx`
   - Feature-specific components: `src/app/(main)/<feature>/_components/<name>.tsx`
   - UI primitives: Use existing Shadcn UI from `src/components/ui/`

2. **Component type**:
   - Default to server components (no directive)
   - Add `"use client"` only if the component needs interactivity, hooks, or browser APIs

3. **Styling**:
   - Use TailwindCSS classes with the `cn()` utility from `@/lib/utils` for conditional classes
   - Use Shadcn UI components as building blocks
   - Use `class-variance-authority` (cva) for component variants

4. **Forms**:
   - Use React Hook Form with `useForm()` hook
   - Define Zod schema for validation
   - Use `@hookform/resolvers/zod` for resolver
   - Use Shadcn Form components (`Form`, `FormField`, `FormItem`, etc.)

5. **Data tables**:
   - Use `@tanstack/react-table` with `useReactTable()`
   - Define column definitions with `ColumnDef`
   - Use Shadcn Table components for rendering

6. **Code style**:
   - Double quotes, semicolons, trailing commas
   - Self-closing elements
   - Import order: react > next > packages > @/ aliases > relative

7. Run `npm run check:fix` after creation
