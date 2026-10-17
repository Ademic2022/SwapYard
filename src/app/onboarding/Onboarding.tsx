"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation } from "urql";

import { PinIcon } from "@/components/icons";
import { PlaceFields } from "@/components/PlaceFields";
import { useMe } from "@/components/Providers";
import { ErrorNote, Spinner } from "@/components/ui";
import { UpdateLocationMutation, UpdateProfileMutation } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { getDeviceLocation } from "@/lib/geo";
import { EMPTY_PLACE, type PlaceDraft } from "@/lib/places";
import { safeNext } from "@/lib/site";

export function Onboarding() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { me, loading, refresh } = useMe();
  const [profileState, updateProfile] = useMutation(UpdateProfileMutation);
  const [locationState, updateLocation] = useMutation(UpdateLocationMutation);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [manual, setManual] = useState(false);
  const [place, setPlace] = useState<PlaceDraft>(EMPTY_PLACE);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string>();

  if (loading) return <Spinner />;
  if (!me) {
    return (
      <div className="text-center">
        <p>Your session has ended.</p>
        <Link href="/login" className="btn-primary mt-4 w-full">
          Sign in
        </Link>
      </div>
    );
  }

  const detected = !manual ? me.place : null;

  async function locate() {
    setLocating(true);
    setLocationNote(undefined);
    try {
      const coords = await getDeviceLocation();
      const result = await updateLocation(coords);
      const found = result.data?.updateLocation.place;
      if (found) {
        setManual(false);
      } else if (!result.error) {
        setManual(true);
        setLocationNote("We couldn't work out your city from your location. Please enter it below.");
      }
    } catch (e) {
      setManual(true);
      setLocationNote((e as Error).message);
    } finally {
      setLocating(false);
    }
  }

  function editManually() {
    setPlace(me?.place ? { state: me.place.state, city: me.place.city, area: me.place.area } : EMPTY_PLACE);
    setManual(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await updateProfile({
      input: {
        displayName: name,
        whatsappNumber: whatsapp.trim() || null,
        place: manual ? { country: "Nigeria", ...place } : null,
      },
    });
    if (result.error) return;
    refresh();
    router.replace(next);
  }

  const fetching = profileState.fetching || locationState.fetching;
  const error = profileState.error ?? locationState.error;
  const hasPlace = manual ? Boolean(place.state && place.city.trim()) : Boolean(detected);

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="eyebrow mb-3">Almost there</p>
        <h1 className="font-display text-4xl leading-tight font-semibold">Nice to meet you.</h1>
        <p className="mt-3 text-ink-500">Neighbors see your first name and area, never your address.</p>
      </div>

      <label className="block">
        <span className="label">Your name</span>
        <input
          required
          minLength={2}
          maxLength={60}
          autoComplete="given-name"
          className="field"
          placeholder="e.g. Tolu"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <fieldset className="space-y-3">
        <legend className="label">Where are you?</legend>

        {detected ? (
          <div className="flex items-center gap-3 rounded-2xl border border-leaf-700 bg-leaf-700 p-4 text-white">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-sun-300">
              <PinIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{detected.label}</span>
              <span className="block text-xs text-leaf-100">
                {detected.state}, {detected.country}
              </span>
            </span>
            <button type="button" onClick={editManually} className="text-sm font-semibold text-sun-300 underline-offset-4 hover:underline">
              Not right?
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="flex w-full items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50 p-4 text-left transition hover:border-ink-300 hover:bg-white"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-leaf-700">
              <PinIcon />
            </span>
            <span>
              <span className="block font-bold">{locating ? "Finding you…" : "Use my current location"}</span>
              <span className="block text-xs text-ink-500">
                We fill in your state, city and area. Your exact spot is never shown.
              </span>
            </span>
          </button>
        )}

        {locationNote && <p className="text-sm font-medium text-sun-800">{locationNote}</p>}

        {manual ? (
          <PlaceFields value={place} onChange={setPlace} />
        ) : (
          !detected && (
            <button type="button" onClick={editManually} className="text-sm font-semibold text-leaf-700 underline decoration-leaf-200 decoration-2 underline-offset-4">
              Or type it in yourself
            </button>
          )
        )}
      </fieldset>

      <label className="block">
        <span className="label">
          WhatsApp number <span className="font-normal text-ink-500">(optional for now)</span>
        </span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="field"
          placeholder="+234 803 123 4567"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />
        <span className="hint">
          Needed only to post listings, so neighbors can message you. It&apos;s never shown on the site.
        </span>
      </label>

      <ErrorNote>{errorMessage(error)}</ErrorNote>
      <button type="submit" className="btn-primary min-h-13 w-full text-base" disabled={fetching || !hasPlace}>
        {fetching ? "Saving…" : "Start exploring"}
      </button>
    </form>
  );
}
