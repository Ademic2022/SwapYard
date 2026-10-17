"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

import { PinIcon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { PlaceFields } from "@/components/PlaceFields";
import { useMe } from "@/components/Providers";
import { Avatar, ErrorNote, GridSkeleton, RequireAuth } from "@/components/ui";
import type { MeFieldsFragment } from "@/gql/graphql";
import {
  ClearLocationMutation,
  DeleteAccountMutation,
  LogoutMutation,
  MyListingsQuery,
  UpdateLocationMutation,
  UpdateProfileMutation,
} from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { getDeviceLocation } from "@/lib/geo";
import { compressImage } from "@/lib/image";
import type { PlaceDraft } from "@/lib/places";

export default function MePage() {
  return (
    <RequireAuth next="/me">
      <Account />
    </RequireAuth>
  );
}

function Account() {
  const { me } = useMe();
  const [tab, setTab] = useState<"listings" | "profile">("listings");
  if (!me) return null;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-leaf-700 p-6 text-white sm:p-8 animate-rise">
        <div aria-hidden="true" className="absolute -top-20 -right-20 size-64 rounded-full bg-leaf-600" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 size-48 rounded-full border-[22px] border-sun-500/25" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <Avatar name={me.displayName} url={me.photoUrl} size={72} />
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-wide text-leaf-200">{me.place?.label ?? "Location not set"}</p>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">{me.displayName}</h1>
            <p className="mt-1 text-sm text-leaf-100">
              {me.ratingCount ? `★ ${me.ratingAvg.toFixed(1)} from ${me.ratingCount} rating${me.ratingCount > 1 ? "s" : ""}` : "No ratings yet"}
            </p>
          </div>
          </div>
          <Link href={`/u/${me.id}`} className="btn border border-white/30 text-white hover:bg-white/10">
            Public profile
          </Link>
        </div>
      </section>

      <div className="inline-grid grid-cols-2 gap-1 rounded-full bg-ink-100 p-1" role="tablist">
        {(["listings", "profile"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-10 rounded-full px-5 text-sm font-semibold transition ${tab === t ? "bg-ink-50 text-ink-900 shadow-card" : "text-ink-500 hover:text-ink-900"}`}
          >
            {t === "listings" ? "My listings" : "Profile & settings"}
          </button>
        ))}
      </div>

      {tab === "listings" ? <MyListings /> : <Settings me={me} />}
    </div>
  );
}

function MyListings() {
  const [{ data, fetching, error }] = useQuery({ query: MyListingsQuery, requestPolicy: "cache-and-network" });
  if (fetching && !data) return <GridSkeleton count={4} />;
  if (error) return <ErrorNote>{errorMessage(error)}</ErrorNote>;
  const listings = data?.myListings ?? [];
  if (listings.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-2xl font-semibold">Nothing posted yet</p>
        <p className="mt-2 text-ink-500">Got a drill, a textbook or a skill? Your neighbors want it.</p>
        <Link href="/post" className="btn-primary mt-4">
          Post a listing
        </Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((l, index) => {
        const badge = l.isHidden
          ? "Hidden"
          : l.isExpired
            ? "Expired"
            : l.status === "DONE"
              ? "Done"
              : l.status === "RESERVED"
                ? "Reserved"
                : undefined;
        return (
          <li key={l.id} className="flex">
            <ListingCard listing={l} badge={badge} index={index} />
          </li>
        );
      })}
    </ul>
  );
}

function Settings({ me }: { me: MeFieldsFragment }) {
  const router = useRouter();
  const { refresh } = useMe();
  const [profileState, updateProfile] = useMutation(UpdateProfileMutation);
  const [locationState, updateLocation] = useMutation(UpdateLocationMutation);
  const [, clearLocation] = useMutation(ClearLocationMutation);
  const [, logout] = useMutation(LogoutMutation);
  const [deleteState, deleteAccount] = useMutation(DeleteAccountMutation);

  const [name, setName] = useState(me.displayName);
  const [bio, setBio] = useState(me.bio);
  const [whatsapp, setWhatsapp] = useState(me.whatsappNumber);
  const [editingPlace, setEditingPlace] = useState(false);
  const [place, setPlace] = useState<PlaceDraft>({
    state: me.place?.state ?? "",
    city: me.place?.city ?? "",
    area: me.place?.area ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [locationError, setLocationError] = useState<string>();
  const [photoError, setPhotoError] = useState<string>();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const result = await updateProfile({
      input: {
        displayName: name,
        bio,
        whatsappNumber: whatsapp,
      },
    });
    if (!result.error) {
      setSaved(true);
      setWhatsapp(result.data?.updateProfile.whatsappNumber ?? whatsapp);
    }
  }

  async function changePhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError(undefined);
    try {
      await updateProfile({ input: {}, photo: await compressImage(file) });
    } catch (e) {
      setPhotoError((e as Error).message);
    }
  }

  async function shareLocation() {
    setLocationError(undefined);
    try {
      const result = await updateLocation(await getDeviceLocation());
      const found = result.data?.updateLocation.place;
      if (found) {
        setPlace({ state: found.state, city: found.city, area: found.area });
        setEditingPlace(false);
      } else if (!result.error) {
        setLocationError("We couldn't work out your city from your location. Enter it below.");
        setEditingPlace(true);
      }
    } catch (e) {
      setLocationError((e as Error).message);
    }
  }

  async function savePlace(e: React.FormEvent) {
    e.preventDefault();
    const result = await updateProfile({ input: { place: { country: "Nigeria", ...place } } });
    if (!result.error) setEditingPlace(false);
  }

  async function signOut() {
    await logout({});
    refresh();
    router.push("/");
  }

  async function removeAccount() {
    const confirmed = window.prompt(
      'This permanently deletes your account, listings, ratings and history. Type "DELETE" to confirm.',
    );
    if (confirmed !== "DELETE") return;
    const result = await deleteAccount({});
    if (!result.error) {
      refresh();
      router.push("/");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <form onSubmit={save} className="card space-y-5 p-6 lg:col-span-7">
        <h2 className="font-display text-xl font-semibold">Profile</h2>
        <div className="flex items-center gap-3">
          <Avatar name={me.displayName} url={me.photoUrl} size={48} />
          <label className="btn-secondary cursor-pointer">
            Change photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => changePhoto(e.target.files?.[0])}
            />
          </label>
          {me.photoUrl && (
            <button type="button" className="btn-ghost" onClick={() => updateProfile({ input: {}, removePhoto: true })}>
              Remove
            </button>
          )}
        </div>
        {photoError && <p className="text-sm text-red-700">{photoError}</p>}

        <label className="block">
          <span className="label">Name</span>
          <input required minLength={2} maxLength={60} className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Short bio</span>
          <textarea maxLength={280} className="field min-h-20" value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">WhatsApp number</span>
          <input
            type="tel"
            inputMode="tel"
            className="field"
            placeholder="+234 803 123 4567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <span className="hint">Required to post. Never shown on the site.</span>
        </label>
        <p className="text-sm text-ink-500">
          Signed in as <span className="font-semibold text-ink-900">{me.email}</span>. Only you can see this.
        </p>
        <ErrorNote>{errorMessage(profileState.error)}</ErrorNote>
        <button type="submit" className="btn-primary w-full" disabled={profileState.fetching}>
          {profileState.fetching ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
        </button>
      </form>

      <div className="space-y-6 lg:col-span-5">
      <section className="card space-y-4 p-6">
        <h2 className="font-display text-xl font-semibold">Location</h2>
        <div className="flex items-start gap-3 rounded-2xl bg-ink-100/70 p-4">
          <PinIcon className="mt-0.5 shrink-0 text-leaf-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{me.place?.label ?? "Not set"}</p>
            {me.place && (
              <p className="text-sm text-ink-500">
                {me.place.state}, {me.place.country}
              </p>
            )}
          </div>
          {!editingPlace && (
            <button type="button" className="text-sm font-semibold text-leaf-700 hover:underline" onClick={() => setEditingPlace(true)}>
              Edit
            </button>
          )}
        </div>
        <p className="text-sm text-ink-500">
          {me.hasLocation
            ? "Distances are measured from your approximate spot, blurred by 100–200 m and never shown."
            : "Share your location to see how far listings are and sort the nearest first."}
        </p>
        {locationError && <p className="text-sm font-medium text-sun-800">{locationError}</p>}
        {editingPlace ? (
          <form onSubmit={savePlace} className="space-y-4">
            <PlaceFields value={place} onChange={setPlace} />
            <p className="hint">Changing your state or city forgets your shared location.</p>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setEditingPlace(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={profileState.fetching}>
                Save location
              </button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={shareLocation} disabled={locationState.fetching}>
              {locationState.fetching ? "Locating…" : me.hasLocation ? "Update from my location" : "Use my location"}
            </button>
            {me.hasLocation && me.place && (
              <button type="button" className="btn-ghost" onClick={() => clearLocation({})}>
                Forget it
              </button>
            )}
          </div>
        )}
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-xl font-semibold">Account</h2>
        <button type="button" className="btn-secondary w-full" onClick={signOut}>
          Sign out
        </button>
        <button type="button" className="btn-danger w-full" onClick={removeAccount} disabled={deleteState.fetching}>
          Delete my account
        </button>
        <ErrorNote>{errorMessage(deleteState.error)}</ErrorNote>
      </section>
      </div>
    </div>
  );
}
