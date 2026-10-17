"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMutation } from "urql";

import { FlagIcon } from "@/components/icons";
import { useMe } from "@/components/Providers";
import { ErrorNote, Modal } from "@/components/ui";
import type { ReportReason, ReportTarget } from "@/gql/graphql";
import { ReportMutation } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";

const REASONS: { value: ReportReason; label: string; listingOnly?: boolean }[] = [
  { value: "SCAM", label: "Scam or fraud" },
  { value: "PROHIBITED", label: "Prohibited item", listingOnly: true },
  { value: "HARASSMENT", label: "Harassment or abuse" },
  { value: "WRONG_NUMBER", label: "WhatsApp number didn't work" },
  { value: "OTHER", label: "Something else" },
];

export function ReportButton({ targetType, targetId }: { targetType: ReportTarget; targetId: string }) {
  const pathname = usePathname();
  const { me } = useMe();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [{ fetching, error, data }, report] = useMutation(ReportMutation);

  const noun = targetType === "LISTING" ? "listing" : "user";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-1 text-ink-500 hover:text-red-700"
      >
        <FlagIcon className="size-4" /> Report {noun}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Report this ${noun}`}>
        {!me ? (
          <div className="space-y-3 text-sm">
            <p>Sign in so we can follow up on your report.</p>
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary w-full">
              Sign in
            </Link>
          </div>
        ) : data?.report ? (
          <div className="space-y-3 text-sm">
            <p>Thanks for letting us know. Our team will review it. If you feel unsafe, stop the conversation.</p>
            <button type="button" className="btn-secondary w-full" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (reason) report({ targetType, targetId, reason, details });
            }}
          >
            <fieldset className="space-y-1">
              <legend className="label">What&apos;s wrong?</legend>
              {REASONS.filter((r) => !r.listingOnly || targetType === "LISTING").map((r) => (
                <label key={r.value} className="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-ink-50">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="size-4 accent-leaf-600"
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </fieldset>
            <label className="block">
              <span className="label">Details (optional)</span>
              <textarea
                className="field min-h-24"
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </label>
            <ErrorNote>{errorMessage(error)}</ErrorNote>
            <button type="submit" className="btn-primary w-full" disabled={!reason || fetching}>
              Send report
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
