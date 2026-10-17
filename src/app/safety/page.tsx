import type { Metadata } from "next";

import { SafetyTipsList } from "@/components/listing/SafetyTipsModal";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Safety tips" };

const PROHIBITED = [
  "Weapons, ammunition and anything designed to harm",
  "Drugs and drug paraphernalia",
  "Alcohol and tobacco, including vapes",
  "Prescription medicines",
  "Counterfeit or replica goods",
  "Live animals",
  "Adult content or services",
  "Stolen goods",
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Safety"
        title="Staying safe on SwapYard"
        description="SwapYard connects neighbors. The exchange itself happens between you, so a little care goes a long way."
      />
      <section className="card p-6 sm:p-8">
        <SafetyTipsList />
      </section>
      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Borrowing and lending</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-700 marker:text-sun-500">
          <li>Agree the return date and any deposit in your WhatsApp chat before the handoff.</li>
          <li>Take photos of the item&apos;s condition when you hand it over and when it comes back.</li>
          <li>Return items on time, clean and charged. Ratings follow you.</li>
        </ul>
      </section>
      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Not allowed on SwapYard</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-700 marker:text-sun-500">
          {PROHIBITED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-500">
          Listings with these items are removed, and repeat offenders are suspended.
        </p>
      </section>
    </div>
  );
}
