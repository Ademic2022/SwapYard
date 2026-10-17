"use client";

import type { PlaceDraft } from "@/lib/places";
import { NIGERIAN_STATES } from "@/lib/places";

/** State, city/LGA and area inputs for people who type their location. */
export function PlaceFields({ value, onChange }: { value: PlaceDraft; onChange: (value: PlaceDraft) => void }) {
  const set = (key: keyof PlaceDraft, v: string) => onChange({ ...value, [key]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="label">State</span>
        <select required className="field" value={value.state} onChange={(e) => set("state", e.target.value)}>
          <option value="" disabled>
            Choose…
          </option>
          {NIGERIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state === "FCT" ? "FCT (Abuja)" : state}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">City or LGA</span>
        <input
          required
          minLength={2}
          maxLength={80}
          className="field"
          placeholder="e.g. Ikeja, Eti Osa"
          value={value.city}
          onChange={(e) => set("city", e.target.value)}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">
          Area <span className="font-normal text-ink-500">(optional)</span>
        </span>
        <input
          maxLength={80}
          className="field"
          placeholder="e.g. Lekki Phase 1, Akoka, Wuse 2"
          value={value.area}
          onChange={(e) => set("area", e.target.value)}
        />
        <span className="hint">Your estate, street area or campus. Never your exact address.</span>
      </label>
    </div>
  );
}
