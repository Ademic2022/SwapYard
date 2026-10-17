"use client";

import { Modal } from "@/components/ui";

export const SAFETY_TIPS = [
  {
    title: "Meet in public or visible places",
    body: "The estate gate, a busy junction or a shop front. Avoid going inside a stranger's home alone.",
  },
  {
    title: "Inspect before you pay",
    body: "Check the item works before any money changes hands.",
  },
  {
    title: "Don't pay deposits to unverified users",
    body: "Look for ratings and verification badges. Be wary of anyone who rushes you or asks for payment upfront.",
  },
  {
    title: "Keep your address private",
    body: "Share only what you need to meet. SwapYard never shows your exact location.",
  },
  {
    title: "Report anything suspicious",
    body: "Use the Report link on any listing or profile. Our team reviews every report.",
  },
];

export function SafetyTipsList() {
  return (
    <ol className="space-y-5">
      {SAFETY_TIPS.map((tip, index) => (
        <li key={tip.title} className="flex gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-leaf-100 font-display font-semibold text-leaf-800">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold">{tip.title}</p>
            <p className="text-sm text-ink-500">{tip.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SafetyTipsModal({
  open,
  onClose,
  onContinue,
}: {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Before you chat">
      <p className="mb-4 text-sm text-ink-700">A few quick tips to keep exchanges safe for everyone.</p>
      <SafetyTipsList />
      <button type="button" className="btn-primary mt-6 w-full" onClick={onContinue}>
        Got it, open WhatsApp
      </button>
    </Modal>
  );
}
