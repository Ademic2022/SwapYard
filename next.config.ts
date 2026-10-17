import type { NextConfig } from "next";

// Django API. The browser talks to it through these rewrites, so the session
// cookie is first-party and no CORS is needed.
const API_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The dev badge sits on top of the mobile tab bar.
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/graphql", destination: `${API_URL}/graphql/` },
      { source: "/api/csrf", destination: `${API_URL}/api/csrf/` },
      { source: "/media/:path*", destination: `${API_URL}/media/:path*` },
    ];
  },
};

export default nextConfig;
