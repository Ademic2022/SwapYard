import "server-only";

import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

const API_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000";

/**
 * Run a GraphQL query from a Server Component. Uses GET, which Django's CSRF
 * check allows, and never sends user cookies: results are public data only.
 */
export async function serverQuery<TData, TVars extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVars>,
  variables: TVars,
): Promise<TData | null> {
  const params = new URLSearchParams({
    query: print(document),
    variables: JSON.stringify(variables),
  });
  try {
    // No fetch-level caching: callers that want it wrap this in "use cache".
    const response = await fetch(`${API_URL}/graphql/?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: TData; errors?: unknown[] };
    return body.data ?? null;
  } catch {
    return null;
  }
}
