"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "urql";

import { WhatsAppIcon } from "@/components/icons";
import { useMe } from "@/components/Providers";
import { ErrorNote } from "@/components/ui";
import type { ListingDetailFieldsFragment } from "@/gql/graphql";
import { AcknowledgeSafetyTipsMutation, ContactListingMutation } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";

import { SafetyTipsModal } from "./SafetyTipsModal";

export function ContactButton({
  listing,
  disabled,
  compact = false,
}: {
  listing: ListingDetailFieldsFragment;
  disabled: boolean;
  /** Mobile action bar: errors show as the button label instead of below it. */
  compact?: boolean;
}) {
  const buttonClass = `btn-whatsapp w-full ${compact ? "min-h-12" : "min-h-13 text-base"}`;
  const { me, loading } = useMe();
  const [showTips, setShowTips] = useState(false);
  const [{ fetching, error }, contact] = useMutation(ContactListingMutation);
  const [, acknowledge] = useMutation(AcknowledgeSafetyTipsMutation);

  if (disabled) {
    return (
      <button type="button" className={buttonClass} disabled>
        <WhatsAppIcon /> Not available
      </button>
    );
  }

  if (loading) {
    return <button type="button" className={buttonClass} disabled aria-busy="true" />;
  }

  if (!me || !me.isOnboarded) {
    const next = `/l/${listing.id}`;
    const href = me ? `/onboarding?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`;
    return (
      <Link href={href} className={buttonClass}>
        <WhatsAppIcon /> Sign in to chat
      </Link>
    );
  }

  async function openChat() {
    // Open the tab synchronously, inside the click: browsers block windows
    // opened after an await. It's pointed at WhatsApp once we have the link.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    const result = await contact({ id: listing.id });
    const url = result.data?.contactListing.whatsappUrl;
    if (!url) {
      tab?.close();
      return;
    }
    if (tab) tab.location.href = url;
    else window.location.assign(url); // Popup blocked: fall back to this tab.
  }

  async function onClick() {
    if (!me?.safetyTipsSeen) {
      setShowTips(true);
      return;
    }
    await openChat();
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <button type="button" className={buttonClass} onClick={onClick} disabled={fetching}>
          <WhatsAppIcon />{" "}
          {fetching ? "Opening WhatsApp…" : compact && error ? "Couldn't open. Try again" : "Chat on WhatsApp"}
        </button>
        {compact ? null : <ErrorNote>{errorMessage(error)}</ErrorNote>}
      </div>
      <SafetyTipsModal
        open={showTips}
        onClose={() => setShowTips(false)}
        onContinue={async () => {
          setShowTips(false);
          const opening = openChat(); // Starts within the click, before any await.
          await acknowledge({});
          await opening;
        }}
      />
    </>
  );
}
