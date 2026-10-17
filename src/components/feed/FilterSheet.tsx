"use client";

import { useState } from "react";

import { Modal } from "@/components/ui";
import type { Condition } from "@/gql/graphql";
import { CONDITION_LABELS } from "@/lib/format";

export type Filters = {
  /** null means any distance. */
  radiusKm: number | null;
  freeOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  condition: Condition | null;
};

export const DEFAULT_FILTERS: Filters = {
  radiusKm: null,
  freeOnly: false,
  minPrice: null,
  maxPrice: null,
  condition: null,
};

export const RADIUS_OPTIONS: (number | null)[] = [null, 1, 3, 5, 10];

export function activeFilterCount(f: Filters): number {
  return [f.freeOnly, f.minPrice !== null, f.maxPrice !== null, f.condition !== null].filter(Boolean).length;
}

function parseAmount(value: string): number | null {
  const n = parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function FilterSheet({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: Filters;
  onClose: () => void;
  onApply: (filters: Filters) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Filters">
      {/* Remount the form each time it opens so it starts from the applied filters. */}
      {open && <FilterForm initial={initial} onApply={onApply} />}
    </Modal>
  );
}

function FilterForm({ initial, onApply }: { initial: Filters; onApply: (filters: Filters) => void }) {
  const [draft, setDraft] = useState(initial);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(draft);
      }}
    >
      <fieldset>
        <legend className="label">Distance</legend>
        <p className="hint mt-0 mb-2">Applies when we know where you are.</p>
        <div className="flex gap-2">
          {RADIUS_OPTIONS.map((km) => (
            <button
              key={km ?? "any"}
              type="button"
              onClick={() => set("radiusKm", km)}
              aria-pressed={draft.radiusKm === km}
              className={`chip flex-1 justify-center ${
                draft.radiusKm === km ? "border-leaf-700 bg-leaf-700 text-white" : "border-ink-200 bg-ink-50 text-ink-700"
              }`}
            >
              {km ? `${km} km` : "Any"}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-ink-50 px-4">
        <span className="text-sm font-semibold">Free things only</span>
        <input
          type="checkbox"
          checked={draft.freeOnly}
          onChange={(e) => set("freeOnly", e.target.checked)}
          className="size-5 accent-leaf-600"
        />
      </label>

      <fieldset disabled={draft.freeOnly}>
        <legend className="label">Price (₦)</legend>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            placeholder="Min"
            aria-label="Minimum price"
            className="field"
            value={draft.minPrice ?? ""}
            onChange={(e) => set("minPrice", parseAmount(e.target.value))}
          />
          <span className="text-ink-400">–</span>
          <input
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum price"
            className="field"
            value={draft.maxPrice ?? ""}
            onChange={(e) => set("maxPrice", parseAmount(e.target.value))}
          />
        </div>
      </fieldset>

      <label className="block">
        <span className="label">Condition</span>
        <select
          className="field"
          value={draft.condition ?? ""}
          onChange={(e) => set("condition", (e.target.value || null) as Condition | null)}
        >
          <option value="">Any</option>
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          className="btn-ghost flex-1"
          onClick={() => setDraft({ ...DEFAULT_FILTERS, radiusKm: draft.radiusKm })}
        >
          Clear
        </button>
        <button type="submit" className="btn-primary flex-1">
          Show results
        </button>
      </div>
    </form>
  );
}
