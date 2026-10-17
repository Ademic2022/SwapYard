"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

import { StarIcon } from "@/components/icons";
import { ErrorNote, PageHeader, RequireAuth, Spinner } from "@/components/ui";
import type { ActivityQuery as ActivityQueryResult, ExchangeOutcome } from "@/gql/graphql";
import { ActivityQuery, LeaveReviewMutation, ReportOutcomeMutation } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { timeAgo } from "@/lib/format";

type Exchange = ActivityQueryResult["pendingFollowups"][number];

export default function ActivityPage() {
  return (
    <RequireAuth next="/activity">
      <Activity />
    </RequireAuth>
  );
}

function Activity() {
  const [{ data, fetching, error }, reexecute] = useQuery({ query: ActivityQuery, requestPolicy: "cache-and-network" });
  const refetch = () => reexecute({ requestPolicy: "network-only" });

  if (fetching && !data) return <Spinner />;
  if (error) return <ErrorNote>{errorMessage(error)}</ErrorNote>;
  const followups = data?.pendingFollowups ?? [];
  const reviewable = data?.reviewableExchanges ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Activity"
        title="How did it go?"
        description="A day after you contact a neighbor, we check in here. Ratings keep the yard friendly."
      />

      {followups.length === 0 && reviewable.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-4xl" aria-hidden="true">🌿</p>
          <p className="mt-3 font-display text-2xl font-semibold">You&apos;re all caught up</p>
          <p className="mt-2 text-ink-500">Nothing waiting on you right now.</p>
        </div>
      )}

      {followups.length > 0 && (
        <section className="space-y-3">
          <h2 className="eyebrow">Did these go through?</h2>
          {followups.map((f) => (
            <FollowupCard key={f.id} exchange={f} onDone={refetch} />
          ))}
        </section>
      )}

      {reviewable.length > 0 && (
        <section className="space-y-3">
          <h2 className="eyebrow">Rate your neighbors</h2>
          {reviewable.map((r) => (
            <ReviewCard key={r.id} exchange={r} onDone={refetch} />
          ))}
        </section>
      )}
    </div>
  );
}

function ExchangeHeader({ exchange, verb }: { exchange: Exchange; verb: string }) {
  return (
    <p className="leading-relaxed">
      {verb} <Link href={`/u/${exchange.otherUserId}`} className="font-semibold hover:underline">{exchange.otherUserName}</Link>{" "}
      about{" "}
      <Link href={`/l/${exchange.listingId}`} className="font-semibold hover:underline">
        {exchange.listingTitle}
      </Link>{" "}
      <span className="text-ink-500">· {timeAgo(exchange.contactedAt)}</span>
    </p>
  );
}

function FollowupCard({ exchange, onDone }: { exchange: Exchange; onDone: () => void }) {
  const [{ fetching, error }, reportOutcome] = useMutation(ReportOutcomeMutation);
  async function answer(outcome: ExchangeOutcome) {
    const result = await reportOutcome({ id: exchange.id, outcome });
    if (!result.error) onDone();
  }
  return (
    <div className="card space-y-4 p-5 animate-rise">
      <ExchangeHeader exchange={exchange} verb="You contacted" />
      <div className="grid grid-cols-3 gap-2">
        <button type="button" className="btn-primary" disabled={fetching} onClick={() => answer("COMPLETED")}>
          Yes
        </button>
        <button type="button" className="btn-secondary" disabled={fetching} onClick={() => answer("NOT_COMPLETED")}>
          No
        </button>
        <button type="button" className="btn-secondary" disabled={fetching} onClick={() => answer("PENDING")}>
          Still talking
        </button>
      </div>
      <ErrorNote>{errorMessage(error)}</ErrorNote>
    </div>
  );
}

function ReviewCard({ exchange, onDone }: { exchange: Exchange & { iContacted?: boolean }; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [{ fetching, error }, leaveReview] = useMutation(LeaveReviewMutation);

  return (
    <form
      className="card space-y-4 p-5 animate-rise"
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await leaveReview({ id: exchange.id, rating, comment });
        if (!result.error) onDone();
      }}
    >
      <ExchangeHeader exchange={exchange} verb={exchange.iContacted ? "You exchanged with" : "You were contacted by"} />
      <fieldset>
        <legend className="sr-only">Rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              onClick={() => setRating(n)}
              className="grid size-11 place-items-center text-sun-500"
            >
              <StarIcon filled={n <= rating} className="size-7" />
            </button>
          ))}
        </div>
      </fieldset>
      <textarea
        className="field min-h-16"
        maxLength={500}
        placeholder="Optional: how was it?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <ErrorNote>{errorMessage(error)}</ErrorNote>
      <button type="submit" className="btn-primary w-full" disabled={!rating || fetching}>
        Submit rating
      </button>
    </form>
  );
}
