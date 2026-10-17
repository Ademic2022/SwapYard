import type { CombinedError } from "urql";

export function errorCode(error: CombinedError | undefined): string | undefined {
  return error?.graphQLErrors[0]?.extensions?.code as string | undefined;
}

export function errorMessage(error: CombinedError | undefined): string | undefined {
  if (!error) return undefined;
  if (error.networkError) return "Can't reach SwapYard. Check your connection and try again.";
  return error.graphQLErrors[0]?.message ?? "Something went wrong. Please try again.";
}
