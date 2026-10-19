import type { Metadata } from "next";

import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};

// Plain-language summary. Have it reviewed against the Nigeria Data Protection
// Act (2023) before launch.
const SECTIONS = [
  {
    title: "What we collect",
    items: [
      "Your email address, to sign you in. It is never shown to other users.",
      "Your name, photo, bio and area (state, city and area name), which other users can see.",
      "Your WhatsApp number, if you add one. It is never displayed; we only use it to open a WhatsApp chat when a signed-in neighbor taps “Chat on WhatsApp”.",
      "An approximate location, only if you choose to share it. We blur it by 100–200 m before saving and never display it. To fill in your state, city and area, we send that blurred point to OpenStreetMap's geocoding service.",
      "Your listings, ratings, reports, and a record of when you tap “Chat on WhatsApp” (not your messages).",
    ],
  },
  {
    title: "What we don't do",
    items: [
      "We don't read your WhatsApp conversations. They happen entirely in WhatsApp.",
      "We don't sell your data.",
      "We don't show anyone your exact address or coordinates.",
      "We remove location data (EXIF) from every photo you upload.",
    ],
  },
  {
    title: "Your choices",
    items: [
      "Edit your profile or remove your WhatsApp number at any time from the Me page.",
      "Clear your shared location at any time.",
      "Delete your account from the Me page. This permanently removes your profile, listings, photos, ratings and history.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Privacy"
        title="Your data, plainly"
        description="We collect as little as we need to connect neighbors, in line with the Nigeria Data Protection Act (2023)."
      />
      {SECTIONS.map((section) => (
        <section key={section.title} className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">{section.title}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-700 marker:text-sun-500">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
