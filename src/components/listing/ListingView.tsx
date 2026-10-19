"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "urql";

import { ChevronLeftIcon, ClockIcon, PinIcon, ShieldIcon } from "@/components/icons";
import { Avatar, CategoryTag, Panel, Rating, Spinner, VerifiedBadge } from "@/components/ui";
import type { ListingDetailFieldsFragment } from "@/gql/graphql";
import { ListingQuery } from "@/lib/documents";
import { CONDITION_LABELS, OFFER_LABELS, monthYear, naira, timeAgo } from "@/lib/format";
import { placePath } from "@/lib/seo";
import { useIsClient } from "@/lib/use-is-client";

import { ContactButton } from "./ContactButton";
import { OwnerActions } from "./OwnerActions";
import { ReportButton } from "./ReportButton";
import { ShareButton } from "./ShareButton";

type Listing = ListingDetailFieldsFragment;

export function ListingView({ id, initial }: { id: string; initial: Listing | null }) {
  const isClient = useIsClient();
  const [{ data, fetching }] = useQuery({ query: ListingQuery, variables: { id }, pause: !isClient });
  const listing = data?.listing ?? initial;

  if (!listing) {
    if (!isClient || fetching) return <Spinner />;
    return (
      <Panel>
        <h1 className="font-display text-2xl font-semibold">This listing isn&apos;t available</h1>
        <p className="mt-2 text-ink-500">It may have been removed by its owner or by our moderators.</p>
        <Link href="/" className="btn-primary mt-6">
          Browse nearby listings
        </Link>
      </Panel>
    );
  }

  const unavailable = listing.status === "DONE" || listing.isExpired || !listing.isLive;
  const shareText = `${listing.title} · ${listing.priceLabel} on SwapYard`;

  return (
    <article className="pb-24 md:pb-0">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li className="flex items-center gap-1">
            <Link href="/" className="inline-flex items-center gap-1 font-semibold transition hover:text-ink-900">
              <ChevronLeftIcon className="size-4" /> All listings
            </Link>
          </li>
          {listing.state && (
            <li className="flex items-center gap-1">
              <span aria-hidden="true">/</span>
              <Link href={placePath(listing.state)} className="font-semibold transition hover:text-ink-900">
                {listing.state}
              </Link>
            </li>
          )}
          {listing.state && listing.city && (
            <li className="flex items-center gap-1">
              <span aria-hidden="true">/</span>
              <Link href={placePath(listing.state, listing.city)} className="font-semibold transition hover:text-ink-900">
                {listing.city}
              </Link>
            </li>
          )}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-8 lg:col-span-7">
          <Gallery listing={listing} />
          <div className="lg:hidden">
            <Summary listing={listing} />
          </div>
          <Details listing={listing} />
          <section className="animate-rise">
            <h2 className="eyebrow mb-3">About this {listing.category === "SKILL" ? "service" : "item"}</h2>
            <p className="max-w-prose text-[1.05rem] leading-relaxed whitespace-pre-line text-ink-700">
              {listing.description}
            </p>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-5 lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <Summary listing={listing} />
            </div>

            {listing.isMine ? (
              <OwnerActions listing={listing} />
            ) : (
              <div className="hidden gap-2 md:flex">
                <div className="flex-1">
                  <ContactButton listing={listing} disabled={unavailable} />
                </div>
                <ShareButton title={listing.title} text={shareText} url={listing.url} />
              </div>
            )}

            <OwnerCard owner={listing.owner} />

            {!listing.isMine && (
              <div className="rounded-2xl border border-ink-200/70 p-4 text-sm">
                <p className="flex items-start gap-3 text-ink-700">
                  <ShieldIcon className="mt-0.5 shrink-0 text-leaf-600" />
                  <span>
                    Meet somewhere public and inspect before paying.{" "}
                    <Link href="/safety" className="font-semibold text-leaf-700 underline decoration-leaf-200 underline-offset-4">
                      Safety tips
                    </Link>
                  </span>
                </p>
                <div className="mt-2 flex justify-end">
                  <ReportButton targetType="LISTING" targetId={listing.id} />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {!listing.isMine && (
        <div className="fixed inset-x-3 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] z-30 flex gap-2 rounded-full bg-ink-50/95 p-1.5 shadow-float backdrop-blur md:hidden">
          <div className="flex-1">
            <ContactButton listing={listing} disabled={unavailable} compact />
          </div>
          <ShareButton title={listing.title} text={shareText} url={listing.url} iconOnly />
        </div>
      )}
    </article>
  );
}

function Summary({ listing }: { listing: Listing }) {
  return (
    <div className="space-y-4 animate-rise">
      <StatusBanner listing={listing} />
      <div className="flex flex-wrap items-center gap-2">
        <CategoryTag category={listing.category} />
        {listing.condition && (
          <span className="rounded-full border border-ink-200 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
            {CONDITION_LABELS[listing.condition]}
          </span>
        )}
      </div>
      <h1 className="font-display text-3xl leading-[1.1] font-semibold text-ink-900 sm:text-4xl">{listing.title}</h1>
      <p className="font-display text-3xl font-semibold text-leaf-600">{listing.priceLabel}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <PinIcon className="size-4" />
          {[listing.distanceLabel && `${listing.distanceLabel} away`, listing.locationLabel].filter(Boolean).join(" · ") ||
            "Nearby"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon className="size-4" />
          Posted {timeAgo(listing.createdAt)}
        </span>
      </div>
    </div>
  );
}

function Gallery({ listing }: { listing: Listing }) {
  const [active, setActive] = useState(0);
  const photos = listing.photos;
  if (photos.length === 0) return null;
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="space-y-3 animate-rise">
      {/* Mobile: swipeable strip. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:hidden">
        {photos.map((photo, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo.id}
            src={photo.url}
            alt={`${listing.title}, photo ${index + 1} of ${photos.length}`}
            loading={index === 0 ? "eager" : "lazy"}
            className={`aspect-[4/5] shrink-0 snap-center rounded-3xl bg-ink-100 object-cover shadow-card ${
              photos.length > 1 ? "w-[86%]" : "w-full"
            }`}
          />
        ))}
      </div>

      {/* Larger screens: main photo with thumbnails. */}
      <div className="hidden sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={`${listing.title}, photo ${active + 1} of ${photos.length}`}
          className="aspect-[4/3] w-full rounded-[2rem] bg-ink-100 object-cover shadow-card"
        />
        {photos.length > 1 && (
          <div className="mt-3 flex gap-3">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={index === active}
                className={`size-20 overflow-hidden rounded-2xl ring-2 ring-offset-2 ring-offset-paper transition ${
                  index === active ? "ring-leaf-600" : "ring-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBanner({ listing }: { listing: Listing }) {
  let message: string | null = null;
  if (listing.isHidden) message = "Hidden after several reports. Our team is reviewing it.";
  else if (listing.status === "DONE")
    message = listing.category === "BORROW" ? "Currently lent out or unavailable." : "No longer available.";
  else if (listing.isExpired) message = listing.isMine ? "Expired. Renew it to show it again." : "This listing has expired.";
  else if (listing.status === "RESERVED") message = "Reserved: someone is already arranging this.";
  if (!message) return null;
  return (
    <p className="flex items-center gap-2 rounded-2xl border border-sun-300 bg-sun-50 px-4 py-3 text-sm font-semibold text-sun-800">
      <span className="size-2 rounded-full bg-sun-500" />
      {message}
    </p>
  );
}

function Details({ listing }: { listing: Listing }) {
  const rows: [string, string][] = [];
  if (listing.category === "BORROW") {
    rows.push(["Fee", listing.borrowFeePerDayNgn ? `${naira(listing.borrowFeePerDayNgn)} / day` : "Free"]);
    if (listing.borrowMaxDays) rows.push(["Up to", `${listing.borrowMaxDays} day${listing.borrowMaxDays > 1 ? "s" : ""}`]);
    rows.push(["Deposit", listing.borrowDepositNgn ? naira(listing.borrowDepositNgn) : "None"]);
    if (listing.availabilityNotes) rows.push(["Availability", listing.availabilityNotes]);
  }
  if (listing.category === "SKILL" && listing.skillOfferType) {
    rows.push(["Offer", OFFER_LABELS[listing.skillOfferType]]);
    if (listing.skillRateNgn) rows.push(["Rate", `${naira(listing.skillRateNgn)} ${listing.skillRateUnit}`.trim()]);
    if (listing.skillTradeFor) rows.push(["Will trade for", listing.skillTradeFor]);
  }
  if (rows.length === 0) return null;
  return (
    <section className="animate-rise">
      <h2 className="eyebrow mb-3">{listing.category === "BORROW" ? "Borrowing terms" : "Terms"}</h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-ink-200/70 bg-ink-50 p-4">
            <dt className="text-xs font-semibold text-ink-500">{label}</dt>
            <dd className="mt-1 font-display text-lg leading-snug font-semibold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function OwnerCard({ owner }: { owner: Listing["owner"] }) {
  return (
    <Link
      href={`/u/${owner.id}`}
      className="card group flex items-center gap-4 p-4 transition hover:border-leaf-200 hover:shadow-lift"
    >
      <Avatar name={owner.displayName} url={owner.photoUrl} size={56} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="eyebrow">Listed by</p>
        <p className="font-display text-lg leading-tight font-semibold group-hover:text-leaf-700">{owner.displayName}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
          <Rating avg={owner.ratingAvg} count={owner.ratingCount} />
          <span>
            {owner.completedExchanges} exchange{owner.completedExchanges === 1 ? "" : "s"}
          </span>
          <span>Since {monthYear(owner.joinedAt)}</span>
        </div>
        {(owner.emailVerified || owner.isVerifiedNeighbor) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {owner.emailVerified && <VerifiedBadge label="Email verified" />}
            {owner.isVerifiedNeighbor && <VerifiedBadge label="Verified neighbor" />}
          </div>
        )}
      </div>
    </Link>
  );
}
