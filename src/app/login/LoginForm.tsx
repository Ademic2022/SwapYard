"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation } from "urql";

import { MailIcon } from "@/components/icons";
import { ErrorNote } from "@/components/ui";
import { RequestMagicLinkMutation } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";

export function LoginForm() {
  const next = useSearchParams().get("next");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [{ fetching, error }, requestLink] = useMutation(RequestMagicLinkMutation);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await requestLink({ email: email.trim(), next });
    if (!result.error) setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-sun-100 text-sun-700">
          <MailIcon width={28} height={28} />
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold">Check your inbox</h1>
        <p className="mt-3 text-ink-700">
          We sent a sign-in link to <strong className="text-ink-900">{sentTo}</strong>. Open it on this device within
          15 minutes.
        </p>
        <p className="mt-6 rounded-2xl border border-ink-200/70 bg-ink-50 px-4 py-3 text-sm text-ink-500">
          Nothing yet? Check your spam or promotions folder, then try again.
        </p>
        <button type="button" className="btn-ghost mt-4" onClick={() => setSentTo(null)}>
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Welcome</p>
        <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">Sign in or join.</h1>
        <p className="mt-3 text-ink-500">
          Same step either way. Enter your email and we&apos;ll send you a link. No password to remember.
        </p>
      </div>
      <label className="block">
        <span className="label">Email address</span>
        <input
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="field"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <ErrorNote>{errorMessage(error)}</ErrorNote>
      <button type="submit" className="btn-primary min-h-13 w-full text-base" disabled={fetching}>
        {fetching ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p className="text-center text-xs leading-relaxed text-ink-500">
        By continuing you agree to keep exchanges friendly and honest. Your email is never shown to other neighbors.
      </p>
    </form>
  );
}
