import Link from "next/link";

import { getPlaceCounts } from "@/lib/public-data";
import { placePath } from "@/lib/seo";

import { ArrowRightIcon, PinIcon } from "./icons";

/** Server-rendered links to the busiest areas: useful to people and to search engines. */
export async function PopularPlaces({ limit = 12 }: { limit?: number }) {
  const places = await getPlaceCounts();
  const cities = places
    .flatMap((p) => p.cities.map((c) => ({ state: p.state, ...c })))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  if (cities.length === 0) return null;

  return (
    <section aria-labelledby="popular-places" className="space-y-4 border-t border-ink-200/70 pt-8">
      <div className="flex items-end justify-between gap-3">
        <h2 id="popular-places" className="font-display text-2xl font-semibold">
          Browse by area
        </h2>
        <Link href="/places" className="inline-flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:underline">
          All areas <ArrowRightIcon width={16} height={16} />
        </Link>
      </div>
      <ul className="flex flex-wrap gap-2">
        {cities.map((c) => (
          <li key={`${c.state}/${c.city}`}>
            <Link
              href={placePath(c.state, c.city)}
              className="chip border-ink-200 bg-ink-50 text-ink-700 hover:border-leaf-300 hover:bg-white"
            >
              <PinIcon className="size-3.5 text-leaf-600" />
              {c.city}, {c.state}
              <span className="text-ink-400">{c.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
