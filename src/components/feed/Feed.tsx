"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "urql";

import { ArrowRightIcon, FilterIcon, PinIcon, SearchIcon } from "@/components/icons";
import { ListingCard } from "@/components/ListingCard";
import { useMe } from "@/components/Providers";
import { CATEGORY_ICONS, ErrorNote, GridSkeleton } from "@/components/ui";
import type { Category, FeedInput, ListingCardFieldsFragment } from "@/gql/graphql";
import { ActivityQuery, FeedQuery, PlaceFacetsQuery } from "@/lib/documents";
import { errorMessage } from "@/lib/errors";
import { getDeviceLocation, type Coords } from "@/lib/geo";
import { CATEGORY_BLURBS, CATEGORY_LABELS } from "@/lib/format";
import { useIsClient } from "@/lib/use-is-client";

import { FilterSheet, type Filters, DEFAULT_FILTERS, activeFilterCount } from "./FilterSheet";

const TABS: (Category | null)[] = [null, "SELL", "BORROW", "SKILL"];
const PREFS_KEY = "swapyard:feed:v2";

type PlaceFilter = { state: string; city: string };
// `place` is null until the viewer picks one; then their own city is the default.
type Prefs = { radiusKm: number | null; place: PlaceFilter | null };

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { radiusKm: null, place: null, ...JSON.parse(raw) };
  } catch {}
  return { radiusKm: null, place: null };
}

function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

/**
 * `initialItems` are the newest listings, rendered on the server so search engines and
 * first-time visitors see content immediately. They stand in until the browser's own
 * query (which may use the viewer's city or location) returns.
 */
export function Feed({ initialItems = [] }: { initialItems?: ListingCardFieldsFragment[] }) {
  const isClient = useIsClient();
  const { me } = useMe();
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [chosenPlace, setChosenPlace] = useState<PlaceFilter | null>(null);
  const [device, setDevice] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const prefs = loadPrefs();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount.
    setFilters((f) => ({ ...f, radiusKm: prefs.radiusKm }));
    setChosenPlace(prefs.place);
  }, []);

  const place: PlaceFilter = chosenPlace ?? { state: me?.place?.state ?? "", city: me?.place?.city ?? "" };

  const input: FeedInput = useMemo(
    () => ({
      category,
      search: deferredSearch,
      radiusKm: filters.radiusKm,
      freeOnly: filters.freeOnly,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      condition: filters.condition,
      lat: device?.lat,
      lng: device?.lng,
      state: place.state,
      city: place.city,
    }),
    [category, deferredSearch, filters, device, place.state, place.city],
  );
  // Restart pagination whenever the query changes.
  const inputKey = JSON.stringify(input);
  const [pages, setPages] = useState<{ key: string; cursors: (string | null)[] }>({ key: inputKey, cursors: [null] });
  const cursors = pages.key === inputKey ? pages.cursors : [null];

  async function locate() {
    setLocating(true);
    setLocationError(undefined);
    try {
      setDevice(await getDeviceLocation());
    } catch (e) {
      setLocationError((e as Error).message);
    } finally {
      setLocating(false);
    }
  }

  function applyFilters(next: Filters) {
    setFilters(next);
    savePrefs({ radiusKm: next.radiusKm, place: chosenPlace });
    setShowFilters(false);
  }

  function choosePlace(next: PlaceFilter) {
    setChosenPlace(next);
    savePrefs({ radiusKm: filters.radiusKm, place: next });
  }

  const filterCount = activeFilterCount(filters);
  // The unfiltered newest-first view is exactly what the server rendered.
  const isDefaultView =
    !category && !deferredSearch && !place.state && !place.city && !device && filterCount === 0 && filters.radiusKm === null;
  const canMeasure = device !== null || Boolean(me?.hasLocation);
  const areaLabel = place.city ? `${place.city} · ${place.state}` : place.state || "Across Nigeria";
  const greeting = me?.displayName ? `Hi ${me.displayName.split(" ")[0]}.` : "Welcome, neighbor.";

  return (
    <div className="space-y-8">
      {me && <FollowupBanner />}

      <section className="relative animate-rise">
        <p className="eyebrow mb-3">{areaLabel}</p>
        <h1 className="max-w-3xl font-display text-[2.1rem] leading-[1.05] font-semibold text-ink-900 sm:text-5xl lg:text-6xl">
          {greeting}{" "}
          <span className="text-ink-500">What do you need from the people</span>{" "}
          <span className="relative whitespace-nowrap text-leaf-600 italic">
            next door?
            <svg aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-2.5 w-full text-sun-500 sm:-bottom-2">
              <path d="M2 8c40-6 80-7 120-4s56 3 76-1" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg">
          SwapYard is the neighborhood marketplace for Nigeria: borrow tools, buy and sell secondhand items, and trade
          skills with people nearby, then chat on WhatsApp.
        </p>

        <div className="mt-7 flex max-w-2xl items-center gap-2 rounded-full border border-ink-200 bg-ink-50 p-1.5 pl-5 shadow-card transition focus-within:border-leaf-500 focus-within:ring-4 focus-within:ring-leaf-100">
          <SearchIcon className="shrink-0 text-ink-400" />
          <label className="flex-1">
            <span className="sr-only">Search listings</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Try "drill", "textbook" or "tutor"'
              className="w-full bg-transparent py-2 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
              enterKeyHint="search"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="btn-secondary relative min-h-11 border-transparent bg-ink-100 px-4 hover:bg-ink-200"
          >
            <FilterIcon width={18} height={18} />
            <span className="hidden sm:inline">Filters</span>
            {filterCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-leaf-600 text-[0.7rem] text-white">{filterCount}</span>
            )}
            <span className="sr-only">{filterCount ? `(${filterCount} active)` : ""}</span>
          </button>
        </div>
      </section>

      <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0" role="tablist" aria-label="Category">
        {TABS.map((tab, i) => {
          const selected = tab === category;
          const Icon = CATEGORY_ICONS[tab ?? "ALL"];
          return (
            <button
              key={tab ?? "all"}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setCategory(tab)}
              style={{ animationDelay: `${80 + i * 50}ms` }}
              className={`group flex min-w-[9.5rem] shrink-0 snap-start items-center gap-3 rounded-2xl border p-3 text-left transition animate-rise sm:min-w-0 ${
                selected
                  ? "border-leaf-700 bg-leaf-700 text-white shadow-lift"
                  : "border-ink-200 bg-ink-50 text-ink-900 hover:border-ink-300 hover:bg-white"
              }`}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${
                  selected ? "bg-white/15 text-sun-300" : "bg-ink-100 text-leaf-700 group-hover:bg-leaf-50"
                }`}
              >
                <Icon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{tab ? CATEGORY_LABELS[tab] : "Everything"}</span>
                <span className={`hidden truncate text-xs sm:block ${selected ? "text-leaf-100" : "text-ink-500"}`}>
                  {tab ? CATEGORY_BLURBS[tab] : "All nearby listings"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-200/70 pb-3">
          <h2 className="font-display text-2xl font-semibold">{deferredSearch ? `Results for “${deferredSearch}”` : canMeasure ? "Nearest first" : "Fresh listings"}</h2>
          <PlaceBar
            place={place}
            onChoose={choosePlace}
            canMeasure={canMeasure}
            device={device !== null}
            locating={locating}
            radiusKm={filters.radiusKm}
            onLocate={locate}
          />
        </div>
        {locationError && <p className="text-sm text-red-700">{locationError}</p>}

        {isClient ? (
          <div className="space-y-8">
            {cursors.map((cursor, index) => (
              <FeedPage
                key={cursor ?? "first"}
                input={input}
                cursor={cursor}
                isLast={index === cursors.length - 1}
                isFirst={index === 0}
                placeholder={index === 0 && isDefaultView ? initialItems : undefined}
                onLoadMore={(next) => setPages({ key: inputKey, cursors: [...cursors, next] })}
              />
            ))}
          </div>
        ) : initialItems.length > 0 ? (
          <ListingGrid items={initialItems} />
        ) : (
          <GridSkeleton />
        )}
      </section>

      <FilterSheet open={showFilters} initial={filters} onClose={() => setShowFilters(false)} onApply={applyFilters} />
    </div>
  );
}

function ListingGrid({ items }: { items: ListingCardFieldsFragment[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((listing, index) => (
        <li key={listing.id} className="flex">
          <ListingCard listing={listing} index={index} badge={listing.status === "RESERVED" ? "Reserved" : undefined} />
        </li>
      ))}
    </ul>
  );
}

function FeedPage({
  input,
  cursor,
  isFirst,
  isLast,
  placeholder,
  onLoadMore,
}: {
  input: FeedInput;
  cursor: string | null;
  isFirst: boolean;
  isLast: boolean;
  /** Server-rendered listings to show while this page loads. */
  placeholder?: ListingCardFieldsFragment[];
  onLoadMore: (cursor: string) => void;
}) {
  const [{ data, fetching, error }] = useQuery({ query: FeedQuery, variables: { filters: input, after: cursor } });
  if (fetching && !data) {
    return placeholder?.length ? <ListingGrid items={placeholder} /> : <GridSkeleton count={isFirst ? 8 : 4} />;
  }
  if (error) return <ErrorNote>{errorMessage(error)}</ErrorNote>;
  const feed = data?.feed;
  if (!feed) return null;
  if (isFirst && feed.items.length === 0) return <EmptyState searching={Boolean(input.search)} />;

  return (
    <>
      <ListingGrid items={feed.items} />
      {isLast && feed.nextCursor && (
        <div className="flex justify-center">
          <button type="button" className="btn-secondary px-8" onClick={() => onLoadMore(feed.nextCursor!)}>
            Show more nearby
          </button>
        </div>
      )}
    </>
  );
}

function PlaceBar(props: {
  place: PlaceFilter;
  onChoose: (place: PlaceFilter) => void;
  canMeasure: boolean;
  device: boolean;
  locating: boolean;
  radiusKm: number | null;
  onLocate: () => void;
}) {
  const isClient = useIsClient();
  const [{ data }] = useQuery({ query: PlaceFacetsQuery, pause: !isClient });
  const facets = data?.placeFacets ?? [];
  const states = [...new Set(facets.map((f) => f.state))];
  const cities = facets.filter((f) => f.state === props.place.state);
  // Keep the viewer's own state/city selectable even before anything is listed there.
  if (props.place.state && !states.includes(props.place.state)) states.unshift(props.place.state);
  if (props.place.city && !cities.some((c) => c.city === props.place.city)) {
    cities.unshift({ country: "", state: props.place.state, city: props.place.city, count: 0 });
  }
  const select =
    "cursor-pointer appearance-none rounded-full border border-ink-200 bg-ink-50 px-4 py-1.5 text-sm font-medium text-ink-900 hover:border-ink-300";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-500">
      <PinIcon className="size-4 text-leaf-600" />
      <select
        aria-label="State"
        className={select}
        value={props.place.state}
        onChange={(e) => props.onChoose({ state: e.target.value, city: "" })}
      >
        <option value="">All states</option>
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      {props.place.state && (
        <select
          aria-label="LGA"
          className={select}
          value={props.place.city}
          onChange={(e) => props.onChoose({ state: props.place.state, city: e.target.value })}
        >
          <option value="">All of {props.place.state}</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city}
              {c.count ? ` (${c.count})` : ""}
            </option>
          ))}
        </select>
      )}
      {props.canMeasure && props.radiusKm && (
        <span>
          within <strong className="text-ink-900">{props.radiusKm} km</strong>
        </span>
      )}
      {!props.device && (
        <button
          type="button"
          onClick={props.onLocate}
          className="font-semibold text-leaf-700 underline decoration-leaf-200 decoration-2 underline-offset-4 hover:decoration-leaf-500"
          disabled={props.locating}
        >
          {props.locating ? "Locating…" : props.canMeasure ? "Use my current location" : "Sort by distance"}
        </button>
      )}
    </div>
  );
}

function EmptyState({ searching }: { searching: boolean }) {
  async function invite() {
    const shareData = {
      title: "SwapYard",
      text: "Join me on SwapYard to borrow, buy and trade with neighbors nearby.",
      url: window.location.origin,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Invite link copied. Paste it in your estate WhatsApp group!");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-leaf-700 px-6 py-14 text-center text-white animate-rise">
      <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full bg-leaf-600" />
      <div aria-hidden="true" className="absolute -bottom-20 -left-10 size-48 rounded-full bg-sun-500/25" />
      <div className="relative">
        <h2 className="font-display text-3xl font-semibold">
          {searching ? "Nothing like that nearby yet" : "Your yard is quiet… for now"}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-leaf-100">
          {searching
            ? "Try a wider radius or different words, or be the first to post it."
            : "Post the first listing and invite neighbors. The best yards start with one drill and a WhatsApp group."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/post" className="btn-accent">
            Post a listing
          </Link>
          <button type="button" onClick={invite} className="btn border border-white/30 text-white hover:bg-white/10">
            Invite neighbors
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowupBanner() {
  const [{ data }] = useQuery({ query: ActivityQuery, requestPolicy: "cache-and-network" });
  const followup = data?.pendingFollowups[0];
  if (!followup) return null;
  return (
    <Link
      href="/activity"
      className="group flex items-center gap-4 rounded-2xl border border-sun-300 bg-sun-50 px-4 py-3.5 text-sm text-sun-800 animate-rise"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sun-100 text-lg" aria-hidden="true">
        🤝
      </span>
      <span className="flex-1 leading-snug">
        Did it go through with <strong className="text-ink-900">{followup.otherUserName}</strong> for “{followup.listingTitle}”?
      </span>
      <ArrowRightIcon className="shrink-0 transition group-hover:translate-x-1" />
    </Link>
  );
}
