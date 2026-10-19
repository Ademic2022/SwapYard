import "server-only";

import { cacheLife } from "next/cache";

import { FeedQuery, ListingIndexQuery, NigeriaStatesQuery, PlaceFacetsQuery } from "./documents";
import { slugify } from "./seo";
import { serverQuery } from "./server-api";

// Public data for server-rendered pages, the sitemap and structured data. Each helper is
// cached with a lifetime, so pages are prerendered and refresh themselves in the background.

export async function getNewestListings() {
  "use cache";
  cacheLife("minutes");
  return (await serverQuery(FeedQuery, { filters: {}, after: null }))?.feed.items ?? [];
}

export async function getListingsIn(state: string, city: string = "") {
  "use cache";
  cacheLife("minutes");
  return (await serverQuery(FeedQuery, { filters: { state, city }, after: null }))?.feed.items ?? [];
}

export async function getPlaceFacets() {
  "use cache";
  cacheLife("minutes");
  return (await serverQuery(PlaceFacetsQuery, {}))?.placeFacets ?? [];
}

export async function getListingIndex() {
  "use cache";
  cacheLife("hours");
  return (await serverQuery(ListingIndexQuery, {}))?.listingIndex ?? [];
}

export async function getNigeriaStates() {
  "use cache";
  cacheLife("days");
  return (await serverQuery(NigeriaStatesQuery, {}))?.nigeriaStates ?? [];
}

/** Map URL slugs back to the official state and LGA names, or null if unknown. */
export async function resolvePlace(stateSlug: string, citySlug?: string) {
  const states = await getNigeriaStates();
  const state = states.find((s) => slugify(s.name) === stateSlug);
  if (!state) return null;
  if (!citySlug) return { state: state.name, city: "", lgas: state.lgas };
  const city = state.lgas.find((lga) => slugify(lga) === citySlug);
  return city ? { state: state.name, city, lgas: state.lgas } : null;
}

/** Live listing counts per state and per LGA. */
export async function getPlaceCounts() {
  const facets = await getPlaceFacets();
  const states = new Map<string, { count: number; cities: { city: string; count: number }[] }>();
  for (const f of facets) {
    const entry = states.get(f.state) ?? { count: 0, cities: [] };
    entry.count += f.count;
    entry.cities.push({ city: f.city, count: f.count });
    states.set(f.state, entry);
  }
  return [...states.entries()]
    .map(([state, v]) => ({ state, ...v, cities: v.cities.sort((a, b) => b.count - a.count) }))
    .sort((a, b) => b.count - a.count);
}
