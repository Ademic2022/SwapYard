import { NextResponse, type NextRequest } from "next/server";

// Django API. The browser only talks to this site; these paths are forwarded,
// so the session cookie stays first-party and no CORS is needed.
const API_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";
// Shared with Django (API_PROXY_SECRET there too). It proves the forwarded
// client IP below came from us, so Django can rate-limit per visitor.
const PROXY_SECRET = process.env.API_PROXY_SECRET;

const DESTINATIONS: Record<string, string> = {
  "/graphql": "/graphql/",
  "/api/csrf": "/api/csrf/",
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const path = DESTINATIONS[pathname] ?? pathname; // /media/... passes through unchanged
  const headers = new Headers(request.headers);
  headers.delete("x-swapyard-proxy");
  headers.delete("x-swapyard-client-ip");
  if (PROXY_SECRET) {
    // On Vercel, x-forwarded-for is set by the platform and can't be spoofed.
    // It travels in our own header because the API's Nginx overwrites
    // X-Real-IP with the connecting address, which is Vercel's.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) {
      headers.set("x-swapyard-client-ip", ip);
      headers.set("x-swapyard-proxy", PROXY_SECRET);
    }
  }
  return NextResponse.rewrite(new URL(`${path}${search}`, API_URL), { request: { headers } });
}

export const config = {
  matcher: ["/graphql", "/api/csrf", "/media/:path*"],
};
