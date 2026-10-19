"use client";

import { useQuery } from "urql";

import { StarIcon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { ReportButton } from "@/components/listing/ReportButton";
import { useMe } from "@/components/Providers";
import { Avatar, ErrorNote, Rating, Spinner, VerifiedBadge } from "@/components/ui";
import type { PublicUserQuery } from "@/gql/graphql";
import { UserQuery } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { monthYear, timeAgo } from "@/lib/format";
import { useIsClient } from "@/lib/use-is-client";

type Profile = NonNullable<PublicUserQuery["user"]>;

/** `initial` is the server-rendered profile; the browser's query refreshes it. */
export function UserProfile({ id, initial }: { id: string; initial: Profile | null }) {
  const isClient = useIsClient();
  const { me } = useMe();
  const [{ data, fetching, error }] = useQuery({ query: UserQuery, variables: { id }, pause: !isClient });

  const loaded = data?.user ?? initial;
  if (!loaded && (!isClient || fetching)) return <Spinner />;
  if (error && !loaded) return <ErrorNote>{errorMessage(error)}</ErrorNote>;
  const user = loaded;
  if (!user) return <p className="card mx-auto max-w-md p-10 text-center">This neighbor&apos;s profile isn&apos;t available.</p>;

  return (
    <div className="space-y-6">
      <section className="card space-y-4 p-6 sm:p-8 animate-rise">
        <div className="flex items-center gap-5">
          <Avatar name={user.displayName} url={user.photoUrl} size={88} />
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">{user.displayName}</h1>
            <p className="text-sm text-ink-500">
              {user.locationLabel ? `${user.locationLabel} · ` : ""}Joined {monthYear(user.joinedAt)}
            </p>
            <Rating avg={user.ratingAvg} count={user.ratingCount} />
          </div>
        </div>
        {user.bio && <p className="max-w-prose leading-relaxed text-ink-700">{user.bio}</p>}
        <div className="flex flex-wrap items-center gap-2">
          {user.emailVerified && <VerifiedBadge label="Email verified" />}
          {user.isVerifiedNeighbor && <VerifiedBadge label="Verified neighbor" />}
          <span className="text-sm text-ink-500">
            {user.completedExchanges} completed exchange{user.completedExchanges === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Active listings</h2>
        {user.activeListings.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing listed right now.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {user.activeListings.map((l, index) => (
              <li key={l.id} className="flex">
                <ListingCard listing={l} index={index} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {user.reviews.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">What neighbors say</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {user.reviews.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-center gap-1 text-sun-500" aria-label={`${r.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <StarIcon key={n} filled={n <= r.rating} className="size-4" />
                  ))}
                </div>
                {r.comment && <p className="mt-3 font-display text-lg leading-snug">“{r.comment}”</p>}
                <p className="mt-3 text-xs font-medium text-ink-500">
                  {r.reviewerName} · {r.listingTitle} · {timeAgo(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {me?.id !== user.id && (
        <div className="flex justify-end text-sm">
          <ReportButton targetType="USER" targetId={user.id} />
        </div>
      )}
    </div>
  );
}
