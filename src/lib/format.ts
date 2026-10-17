import type { Category, Condition, SkillOfferType } from "@/gql/graphql";

export const CATEGORY_LABELS: Record<Category, string> = {
  SELL: "Buy & Sell",
  BORROW: "Borrow",
  SKILL: "Skills",
};

export const CATEGORY_STYLES: Record<Category, string> = {
  SELL: "bg-sun-100 text-sun-800",
  BORROW: "bg-leaf-100 text-leaf-800",
  SKILL: "bg-lagoon-100 text-lagoon-800",
};

export const CATEGORY_DOT: Record<Category, string> = {
  SELL: "bg-sun-500",
  BORROW: "bg-leaf-500",
  SKILL: "bg-lagoon-500",
};

export const CATEGORY_BLURBS: Record<Category, string> = {
  SELL: "Pre-loved finds, cheap or free",
  BORROW: "Tools & gear for a few days",
  SKILL: "Tutors, fixers, creatives",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For parts / not working",
};

export const OFFER_LABELS: Record<SkillOfferType, string> = {
  PAID: "Paid",
  TRADE: "Trade",
  EITHER: "Paid or trade",
};

export function naira(amount: number | null | undefined): string {
  return `₦${(amount ?? 0).toLocaleString("en-NG")}`;
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "y"],
    [60 * 60 * 24 * 30, "mo"],
    [60 * 60 * 24 * 7, "w"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"],
  ];
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return "just now";
}

export function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}

export function daysLeft(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
