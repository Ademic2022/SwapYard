import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/JsonLd";
import { ListingView } from "@/components/listing/ListingView";
import { Spinner } from "@/components/ui";
import { ListingQuery } from "@/lib/documents";
import { CATEGORY_LABELS } from "@/lib/format";
import { listingSchema } from "@/lib/listing-schema";
import { serverQuery } from "@/lib/server-api";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/l/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = (await serverQuery(ListingQuery, { id }))?.listing;
  if (!listing) return { title: "Listing not available", robots: { index: false } };

  const city = listing.city ? ` in ${listing.city}, ${listing.state}` : "";
  const title = `${listing.title} · ${listing.priceLabel}${city}`;
  const where = listing.locationLabel ? ` in ${listing.locationLabel}` : "";
  const description = `${CATEGORY_LABELS[listing.category]}${where}. ${listing.description}`.slice(
    0,
    200,
  );
  const photo = listing.photos[0];
  return {
    title,
    description,
    alternates: { canonical: `/l/${listing.id}` },
    // Sold, lent out or expired: the page still works for shared links, but leaves search results.
    robots: listing.isLive && listing.status !== "DONE" ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/l/${listing.id}`,
      images: photo
        ? [{ url: new URL(photo.url, SITE_URL).toString(), width: photo.width ?? undefined, height: photo.height ?? undefined }]
        : [],
    },
    twitter: { card: photo ? "summary_large_image" : "summary", title, description },
  };
}

async function ListingLoader({ params }: { params: PageProps<"/l/[id]">["params"] }) {
  const { id } = await params;
  // Public data only; the client re-fetches with the session to learn ownership.
  const listing = (await serverQuery(ListingQuery, { id }))?.listing ?? null;
  return (
    <>
      {listing && <JsonLd data={listingSchema(listing)} />}
      <ListingView id={id} initial={listing} />
    </>
  );
}

export default function ListingPage({ params }: PageProps<"/l/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      <ListingLoader params={params} />
    </Suspense>
  );
}
