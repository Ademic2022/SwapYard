"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";

import { ErrorNote } from "@/components/ui";
import type { ListingDetailFieldsFragment, ListingStatus } from "@/gql/graphql";
import {
  DeleteListingMutation,
  RenewListingMutation,
  SetListingStatusMutation,
} from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { daysLeft } from "@/lib/format";

import { ShareButton } from "./ShareButton";

const DONE_LABEL = { SELL: "Mark as sold", BORROW: "Mark as lent out", SKILL: "Mark unavailable" } as const;

export function OwnerActions({ listing }: { listing: ListingDetailFieldsFragment }) {
  const router = useRouter();
  const [statusState, setStatus] = useMutation(SetListingStatusMutation);
  const [renewState, renew] = useMutation(RenewListingMutation);
  const [deleteState, remove] = useMutation(DeleteListingMutation);
  const busy = statusState.fetching || renewState.fetching || deleteState.fetching;
  const error = statusState.error ?? renewState.error ?? deleteState.error;

  const change = (status: ListingStatus) => setStatus({ id: listing.id, status });
  const remaining = daysLeft(listing.expiresAt);

  async function onDelete() {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    const result = await remove({ id: listing.id });
    if (!result.error) router.push("/me");
  }

  return (
    <section className="card space-y-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Manage your listing</h2>
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
          {listing.isExpired ? "Expired" : `Expires in ${remaining} day${remaining === 1 ? "" : "s"}`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/l/${listing.id}/edit`} className="btn-secondary">
          Edit
        </Link>
        <ShareButton title={listing.title} text={`${listing.title} · ${listing.priceLabel} on SwapYard`} url={listing.url} />
        {listing.status === "ACTIVE" && !listing.isExpired && (
          <>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => change("RESERVED")}>
              Mark reserved
            </button>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => change("DONE")}>
              {DONE_LABEL[listing.category]}
            </button>
          </>
        )}
        {listing.status === "RESERVED" && !listing.isExpired && (
          <>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => change("ACTIVE")}>
              Available again
            </button>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => change("DONE")}>
              {DONE_LABEL[listing.category]}
            </button>
          </>
        )}
        {(listing.status === "DONE" || listing.isExpired || remaining <= 7) && (
          <button type="button" className="btn-primary col-span-2" disabled={busy} onClick={() => renew({ id: listing.id })}>
            {listing.status === "DONE" ? "Relist for 30 days" : "Renew for 30 days"}
          </button>
        )}
      </div>
      <ErrorNote>{errorMessage(error)}</ErrorNote>
      <button type="button" className="btn-danger w-full" disabled={busy} onClick={onDelete}>
        Delete listing
      </button>
    </section>
  );
}
