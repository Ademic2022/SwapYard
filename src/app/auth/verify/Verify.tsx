"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "urql";

import { useMe } from "@/components/Providers";
import { Spinner } from "@/components/ui";
import { VerifyMagicLinkMutation } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { safeNext } from "@/lib/site";

export function Verify() {
  const params = useSearchParams();
  const router = useRouter();
  const { refresh } = useMe();
  const [, verify] = useMutation(VerifyMagicLinkMutation);
  const [error, setError] = useState<string>();
  const started = useRef(false);

  useEffect(() => {
    // Tokens are single use, so guard against React running the effect twice.
    if (started.current) return;
    started.current = true;
    const token = params.get("token");
    const next = safeNext(params.get("next"));
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off response to a missing URL param.
      setError("This sign-in link is incomplete.");
      return;
    }
    verify({ token }).then((result) => {
      if (result.error || !result.data) {
        setError(errorMessage(result.error));
        return;
      }
      refresh();
      const me = result.data.verifyMagicLink;
      router.replace(me.isOnboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`);
    });
  }, [params, router, verify, refresh]);

  if (!error) return <Spinner label="Signing you in" />;
  return (
    <div className="card mx-auto mt-10 max-w-md p-8 text-center">
      <h1 className="font-display text-2xl font-semibold">Couldn&apos;t sign you in</h1>
      <p className="mt-2 text-sm text-ink-700">{error}</p>
      <Link href="/login" className="btn-primary mt-4 w-full">
        Get a new link
      </Link>
    </div>
  );
}
