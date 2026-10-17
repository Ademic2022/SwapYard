import Link from "next/link";
import type { CSSProperties } from "react";

import type { ListingCardFieldsFragment } from "@/gql/graphql";
import { CATEGORY_DOT, CATEGORY_LABELS } from "@/lib/format";

import { PinIcon } from "./icons";

export function ListingCard({
  listing,
  badge,
  index = 0,
}: {
  listing: ListingCardFieldsFragment;
  badge?: string;
  /** Position in the grid, used to stagger the entrance animation. */
  index?: number;
}) {
  const photo = listing.photos[0];
  const style = { animationDelay: `${Math.min(index, 11) * 45}ms` } as CSSProperties;
  return (
    <Link href={`/l/${listing.id}`} className="group flex w-full flex-col gap-3 animate-rise" style={style}>
      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-square rounded-3xl bg-ink-100 shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center font-display text-4xl text-ink-300">SY</div>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-ink-50/95 px-3 py-1 text-sm font-bold text-ink-900 shadow-card backdrop-blur">
          {listing.priceLabel}
        </span>
        {listing.distanceLabel && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-0.5 rounded-full bg-ink-900/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            <PinIcon className="size-3" />
            {listing.distanceLabel}
          </span>
        )}
        {badge && (
          <span className="absolute top-3 left-3 rounded-full bg-sun-500 px-2.5 py-1 text-xs font-bold text-ink-900">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1 px-1">
        <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-semibold text-ink-900 decoration-leaf-300 decoration-2 underline-offset-4 group-hover:underline">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <span className={`size-1.5 rounded-full ${CATEGORY_DOT[listing.category]}`} />
          {CATEGORY_LABELS[listing.category]}
          {listing.locationLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{listing.locationLabel}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
