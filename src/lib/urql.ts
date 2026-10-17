import { Client, cacheExchange, fetchExchange } from "urql";

export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "/graphql";
const CSRF_URL = process.env.NEXT_PUBLIC_CSRF_URL ?? "/api/csrf";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfRequest: Promise<unknown> | null = null;

// Django rejects POSTs without a CSRF token. The first request fetches the
// cookie; every request echoes it back in the X-CSRFToken header.
async function ensureCsrfCookie() {
  if (readCookie("csrftoken")) return;
  csrfRequest ??= fetch(CSRF_URL, { credentials: "include" }).finally(() => {
    csrfRequest = null;
  });
  await csrfRequest;
}

async function csrfFetch(input: RequestInfo | URL, init?: RequestInit) {
  await ensureCsrfCookie();
  const headers = new Headers(init?.headers);
  headers.set("X-CSRFToken", readCookie("csrftoken") ?? "");
  return fetch(input, { ...init, headers, credentials: "include" });
}

export function makeClient() {
  return new Client({
    url: GRAPHQL_URL,
    exchanges: [cacheExchange, fetchExchange],
    fetch: csrfFetch,
  });
}
