"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

import { MailIcon } from "@/components/icons";
import { useMe } from "@/components/Providers";
import { ErrorNote, Spinner } from "@/components/ui";
import { MagicLinkPreviewQuery, VerifyMagicLinkMutation } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { safeNext } from "@/lib/site";
import { useIsClient } from "@/lib/use-is-client";

/**
 * Sign-in only happens when the user taps "Continue". Opening the link just
 * shows which account it's for, so a link someone else sent can't silently
 * sign you into their account.
 */
export function Verify() {
  const isClient = useIsClient();
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const next = safeNext(params.get("next"));
  const { me, loading: meLoading, refresh } = useMe();
  const [{ data, fetching, error: previewError }] = useQuery({
    query: MagicLinkPreviewQuery,
    variables: { token },
    pause: !isClient || !token,
    requestPolicy: "network-only",
  });
  const [verifyState, verify] = useMutation(VerifyMagicLinkMutation);
  const [done, setDone] = useState(false);

  async function continueSignIn() {
    const result = await verify({ token });
    if (result.error || !result.data) return;
    setDone(true);
    refresh();
    const user = result.data.verifyMagicLink;
    router.replace(user.isOnboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  }

  if (!token) return <Problem message="This sign-in link is incomplete." />;
  if (!isClient || fetching || meLoading || done) return <Spinner label="Checking your link" />;
  if (previewError) return <Problem message={errorMessage(previewError)} />;

  const preview = data?.magicLinkPreview;
  if (!preview) return <Problem message="This sign-in link is invalid or has expired. Request a new one." />;

  const signedInElsewhere = me && me.email !== preview.email;
  if (me && !signedInElsewhere) {
    // Already signed in to this exact account: nothing to switch.
    return (
      <Card>
        <h1 className="font-display text-3xl font-semibold">You&apos;re already signed in</h1>
        <p className="mt-3 text-ink-700">
          as <strong className="text-ink-900">{preview.email}</strong>.
        </p>
        <Link href={next} className="btn-primary mt-6 w-full">
          Continue
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-leaf-100 text-leaf-700">
        <MailIcon width={26} height={26} />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold">
        {preview.isNewAccount ? "Create your account" : "Sign in to SwapYard"}
      </h1>
      <p className="mt-3 text-ink-700">
        Continue as <strong className="break-all text-ink-900">{preview.email}</strong>?
      </p>
      {signedInElsewhere && (
        <p className="mt-4 rounded-2xl border border-sun-300 bg-sun-50 px-4 py-3 text-sm text-sun-800">
          You&apos;re currently signed in as <strong>{me.email}</strong>. Continuing will switch accounts.
        </p>
      )}
      <div className="mt-6 space-y-3">
        <ErrorNote>{errorMessage(verifyState.error)}</ErrorNote>
        <button
          type="button"
          className="btn-primary min-h-13 w-full text-base"
          onClick={continueSignIn}
          disabled={verifyState.fetching}
        >
          {verifyState.fetching ? "Signing in…" : "Continue"}
        </button>
        <Link href="/login" className="btn-ghost w-full">
          That&apos;s not my email
        </Link>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink-500">
        Only continue if you asked for this link. Never use a sign-in link someone else sent you.
      </p>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="card mx-auto mt-10 max-w-md p-8 text-center animate-rise">{children}</div>;
}

function Problem({ message }: { message?: string }) {
  return (
    <Card>
      <h1 className="font-display text-2xl font-semibold">Couldn&apos;t sign you in</h1>
      <p className="mt-2 text-sm text-ink-700">{message}</p>
      <Link href="/login" className="btn-primary mt-6 w-full">
        Get a new link
      </Link>
    </Card>
  );
}
