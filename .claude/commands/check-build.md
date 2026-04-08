---
description: Run Biome check and Next.js build to catch errors
---

# Check Build

Run all checks to verify the project builds correctly.

## Steps

1. Run `npm run check` to verify Biome lint and format pass
2. If Biome fails, run `npm run check:fix` to auto-fix issues and report what was fixed
3. Run `npm run build` to verify the Next.js production build succeeds
4. Report any errors found with file paths and line numbers
5. Suggest fixes for any build errors
