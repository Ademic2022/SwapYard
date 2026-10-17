"use client";

import { useState } from "react";

import { ShareIcon } from "@/components/icons";

export function ShareButton({
  title,
  text,
  url,
  iconOnly = false,
}: {
  title: string;
  text: string;
  url: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`btn-secondary ${iconOnly ? "min-h-12 px-4" : "min-h-13"}`}
      aria-label={iconOnly ? (copied ? "Link copied" : "Share") : undefined}
      aria-live="polite"
    >
      <ShareIcon />
      {!iconOnly && (copied ? "Copied!" : "Share")}
    </button>
  );
}
