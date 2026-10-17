"use client";

import { useId } from "react";
import { useQuery } from "urql";

import { NigeriaStatesQuery } from "@/lib/documents";
import type { PlaceDraft } from "@/lib/places";

/** State, LGA and area pickers. Choosing a state loads its LGAs. */
export function PlaceFields({ value, onChange }: { value: PlaceDraft; onChange: (value: PlaceDraft) => void }) {
  const [{ data, fetching }] = useQuery({ query: NigeriaStatesQuery });
  const states = data?.nigeriaStates ?? [];
  const lgas = states.find((s) => s.name === value.state)?.lgas ?? [];
  const id = useId();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-state`} className="label">
          State
        </label>
        <select
          id={`${id}-state`}
          required
          className="field"
          value={value.state}
          disabled={fetching && !data}
          // A new state means a new LGA list.
          onChange={(e) => onChange({ ...value, state: e.target.value, city: "" })}
        >
          <option value="" disabled>
            {fetching && !data ? "Loading…" : "Choose…"}
          </option>
          {states.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name === "FCT" ? "FCT (Abuja)" : s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-lga`} className="label">
          LGA
        </label>
        <select
          id={`${id}-lga`}
          required
          className="field"
          value={value.city}
          disabled={!value.state}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        >
          <option value="" disabled>
            {value.state ? "Choose…" : "Pick a state first"}
          </option>
          {lgas.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>
      </div>
      <label className="block sm:col-span-2">
        <span className="label">
          Area <span className="font-normal text-ink-500">(optional)</span>
        </span>
        <input
          maxLength={80}
          className="field"
          placeholder="e.g. Lekki Phase 1, Akoka, Wuse 2"
          value={value.area}
          onChange={(e) => onChange({ ...value, area: e.target.value })}
        />
        <span className="hint">Your estate, district or campus. Never your exact address.</span>
      </label>
    </div>
  );
}
