import type { Metadata } from "next";
import { Suspense } from "react";

import { ListingView } from "@/components/listing/ListingView";
import { Spinner } from "@/components/ui";
import { ListingQuery } from "@/lib/documents";
import { CATEGORY_LABELS } from "@/lib/format";
import { serverQuery } from "@/lib/server-api";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/l/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = (await serverQuery(ListingQuery, { id }))?.listing;
  if (!listing) return { title: "Listing not found", robots: { index: false } };

  const title = `${listing.title} · ${listing.priceLabel}`;
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
  return <ListingView id={id} initial={listing} />;
}

export default function ListingPage({ params }: PageProps<"/l/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      <ListingLoader params={params} />
    </Suspense>
  );
}
