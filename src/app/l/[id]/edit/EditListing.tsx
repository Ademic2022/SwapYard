"use client";

import Link from "next/link";
import { useQuery } from "urql";

import { ListingForm } from "@/components/listing/ListingForm";
import { PageHeader, RequireAuth, Spinner } from "@/components/ui";
import { ListingQuery } from "@/lib/documents";
import { useIsClient } from "@/lib/use-is-client";

export function EditListingClient({ id }: { id: string }) {
  return (
    <RequireAuth next={`/l/${id}/edit`}>
      <EditListing id={id} />
    </RequireAuth>
  );
}

function EditListing({ id }: { id: string }) {
  const isClient = useIsClient();
  const [{ data, fetching }] = useQuery({ query: ListingQuery, variables: { id }, pause: !isClient, requestPolicy: "network-only" });
  if (!isClient || fetching) return <Spinner />;
  const listing = data?.listing;
  if (!listing?.isMine) {
    return (
      <div className="card p-6 text-center">
        <p>You can only edit your own listings.</p>
        <Link href="/me" className="btn-secondary mt-4">
          My listings
        </Link>
      </div>
    );
  }
  return (
    <>
      <PageHeader eyebrow="Edit listing" title={listing.title} />
      <ListingForm existing={listing} />
    </>
  );
}
