---
description: Create a new API route with validation, auth, and error handling
---

# Generate API Route

Create a new Next.js API route for the X-Rovula application.

**Route description**: $ARGUMENTS

## Requirements

1. Create the route file at `src/app/api/<name>/route.ts`

2. Follow this pattern:
   - Import `NextResponse` from `next/server`
   - Import `getServerSession` from `next-auth` for authentication
   - Import `prisma` from `@/lib/db` for database access
   - Import `z` from `zod` for request validation

3. Authentication:
   - Check session with `getServerSession(authOptions)`
   - Return 401 if unauthorized

4. Validation:
   - Define Zod schemas for request bodies
   - Parse and validate input before processing

5. Error handling:
   - Try/catch blocks around database operations
   - Return appropriate status codes (400, 401, 404, 500)
   - Return JSON error messages

6. Response format:
   - Use `NextResponse.json(data)` for success responses
   - Use `NextResponse.json({ error: message }, { status: code })` for errors

7. For CRUD resources, create:
   - `route.ts` with GET (list) and POST (create)
   - `[id]/route.ts` with GET (detail), PATCH (update), DELETE

8. Run `npm run check:fix` after creation
