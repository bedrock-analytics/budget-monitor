---
description: Add a new Prisma model with migration
---

# Generate Database Model

Add a new Prisma model to the X-Rovula database schema.

**Model description**: $ARGUMENTS

## Steps

1. Read the current schema at `prisma/schema.prisma`

2. Add the new model following existing patterns:
   - Use `@id @default(cuid())` for primary keys
   - Include `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
   - Add `@@index` for frequently queried fields
   - Define proper relations with `@relation` and cascade deletes where appropriate
   - Use `Decimal` type with `@db.Decimal(20, 2)` for monetary values
   - Add enums if needed for status fields

3. Run `npx prisma format` to format the schema

4. Generate the Prisma client with `npm run prisma:generate`

5. Create corresponding TypeScript interfaces in `src/types/` if needed

6. Add utility functions in `src/lib/` if the model needs:
   - Number generation (e.g., PR-YYYYMM-XXXX pattern)
   - Status formatting helpers
   - Currency formatting
