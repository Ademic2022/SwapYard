import Link from "next/link";

import type { ListingCardFieldsFragment } from "@/gql/graphql";
import { absoluteUrl } from "@/lib/seo";

import { ChevronLeftIcon, PinIcon } from "./icons";
import { JsonLd } from "./JsonLd";
import { ListingCard } from "./ListingCard";

type Crumb = { name: string; path: string };

/** Shared layout for state and LGA landing pages. Fully server-rendered. */
export function PlaceListingPage({
  title,
  intro,
  crumbs,
  listings,
  nearby,
  nearbyTitle,
}: {
  title: string;
  intro: string;
  crumbs: Crumb[];
  listings: ListingCardFieldsFragment[];
  nearby: { name: string; path: string; count: number }[];
  nearbyTitle: string;
}) {
  return (
    <div className="space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.path),
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.slice(0, -1).map((c) => (
            <li key={c.path} className="flex items-center gap-1">
              <Link href={c.path} className="font-semibold hover:text-ink-900">
                {c.name}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
          ))}
          <li aria-current="page" className="text-ink-700">
            {crumbs.at(-1)?.name}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl animate-rise">
        <p className="eyebrow mb-3 flex items-center gap-1.5">
          <PinIcon className="size-4 text-leaf-600" /> Neighborhood marketplace
        </p>
        <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-500">{intro}</p>
      </header>

      {listings.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing, index) => (
            <li key={listing.id} className="flex">
              <ListingCard listing={listing} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-10 text-center">
          <p className="font-display text-2xl font-semibold">Nothing listed here yet</p>
          <p className="mt-2 text-ink-500">Be the first: post something you can lend, sell or teach.</p>
          <Link href="/post" className="btn-primary mt-6">
            Post a listing
          </Link>
        </div>
      )}

      {nearby.length > 0 && (
        <section aria-labelledby="nearby" className="space-y-4 border-t border-ink-200/70 pt-8">
          <h2 id="nearby" className="font-display text-2xl font-semibold">
            {nearbyTitle}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {nearby.map((n) => (
              <li key={n.path}>
                <Link href={n.path} className="chip border-ink-200 bg-ink-50 text-ink-700 hover:border-leaf-300 hover:bg-white">
                  {n.name}
                  <span className="text-ink-400">{n.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ChevronLeftIcon className="size-4" /> All listings
      </Link>
    </div>
  );
}

