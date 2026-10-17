"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import type { Category } from "@/gql/graphql";
import { CATEGORY_DOT, CATEGORY_LABELS, CATEGORY_STYLES } from "@/lib/format";

import { CheckBadgeIcon, GridIcon, LogoMark, LoopIcon, SparkIcon, StarIcon, TagIcon, XIcon } from "./icons";
import { useMe } from "./Providers";

export const CATEGORY_ICONS = { SELL: TagIcon, BORROW: LoopIcon, SKILL: SparkIcon, ALL: GridIcon } as const;

export function CategoryTag({ category, variant = "soft" }: { category: Category; variant?: "soft" | "dot" }) {
  if (variant === "dot") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
        <span className={`size-2 rounded-full ${CATEGORY_DOT[category]}`} />
        {CATEGORY_LABELS[category]}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${CATEGORY_STYLES[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl leading-tight font-semibold text-ink-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-base leading-relaxed text-ink-500">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function ErrorNote({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
      {children}
    </p>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex justify-center py-16">
      <LogoMark size={36} className="animate-pulse" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="aspect-[4/5] skeleton rounded-3xl sm:aspect-square" />
      <div className="h-4 w-3/4 skeleton" />
      <div className="h-3 w-1/3 skeleton" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading listings</span>
    </div>
  );
}

const AVATAR_TONES = ["bg-leaf-100 text-leaf-800", "bg-sun-100 text-sun-800", "bg-lagoon-100 text-lagoon-800"];

export function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover ring-2 ring-ink-50"
        style={{ width: size, height: size }}
      />
    );
  }
  const tone = AVATAR_TONES[(name.charCodeAt(0) || 0) % AVATAR_TONES.length];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-display font-semibold ring-2 ring-ink-50 ${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function Rating({ avg, count }: { avg: number; count: number }) {
  if (count === 0) return <span className="text-sm text-ink-500">New neighbor</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-ink-700">
      <StarIcon filled className="size-4 text-sun-500" />
      <span className="font-semibold text-ink-900">{avg.toFixed(1)}</span>
      <span className="text-ink-500">({count})</span>
    </span>
  );
}

export function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-leaf-200 bg-leaf-50 px-2.5 py-0.5 text-xs font-semibold text-leaf-700">
      <CheckBadgeIcon className="size-3.5" />
      {label}
    </span>
  );
}

/** Native <dialog>: focus trapping and Escape handling come for free. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-ink-50 p-0 text-ink-900 shadow-float backdrop:bg-leaf-900/40 backdrop:backdrop-blur-sm max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <button type="button" onClick={onClose} className="btn-ghost -mr-3 min-h-11 px-3" aria-label="Close">
          <XIcon />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 pt-2 pb-6">{children}</div>
    </dialog>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card mx-auto mt-6 max-w-md p-8 text-center animate-rise ${className}`}>{children}</div>;
}

/** Shows `children` to signed-in users, a sign-in prompt to everyone else. */
export function RequireAuth({ children, next }: { children: ReactNode; next: string }) {
  const { me, loading } = useMe();
  if (loading) return <Spinner />;
  if (!me) {
    return (
      <Panel>
        <LogoMark size={48} className="mx-auto" />
        <h1 className="mt-5 font-display text-2xl font-semibold">Sign in to continue</h1>
        <p className="mt-2 text-ink-500">We&apos;ll email you a sign-in link. No password to remember.</p>
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn-primary mt-6 w-full">
          Continue with email
        </Link>
      </Panel>
    );
  }
  if (!me.isOnboarded) {
    return (
      <Panel>
        <LogoMark size={48} className="mx-auto" />
        <h1 className="mt-5 font-display text-2xl font-semibold">One more step</h1>
        <p className="mt-2 text-ink-500">Tell neighbors your name and where you are.</p>
        <Link href={`/onboarding?next=${encodeURIComponent(next)}`} className="btn-primary mt-6 w-full">
          Finish your profile
        </Link>
      </Panel>
    );
  }
  return <>{children}</>;
}
