import { NextResponse } from "next/server";

interface WindowState {
  count: number;
  windowStart: number;
}

// In-memory only: resets on server restart and does not coordinate across multiple
// instances/replicas behind a load balancer. Acceptable at this app's scale (internal
// enterprise tool, single Coolify deployment) -- revisit with a shared store (e.g. Redis)
// if this is ever horizontally scaled.
const buckets = new Map<string, WindowState>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const state = buckets.get(key);

  if (!state || now - state.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (state.count >= limit) return false;

  state.count += 1;
  return true;
}

export function rateLimitResponse(key: string, limit: number, windowMs: number): NextResponse | null {
  if (checkRateLimit(key, limit, windowMs)) return null;
  return NextResponse.json({ error: "Too many requests, please slow down" }, { status: 429 });
}
