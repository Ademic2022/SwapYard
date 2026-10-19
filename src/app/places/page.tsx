import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/ui";
import { getPlaceCounts } from "@/lib/public-data";
import { absoluteUrl, placePath, stateName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Browse by area: neighborhood marketplaces across Nigeria",
  description:
    "Find things to borrow, buy and trade near you. Browse SwapYard listings by state and local government area across Nigeria.",
  alternates: { canonical: "/places" },
};

export default async function PlacesPage() {
  const places = await getPlaceCounts();
  return (
    <div className="space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "SwapYard", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Areas", item: absoluteUrl("/places") },
          ],
        }}
      />
      <PageHeader
        eyebrow="Browse by area"
        title="Neighborhood marketplaces across Nigeria"
        description="Pick your state and local government area to see what neighbors are lending, selling and offering."
      />
      {places.length === 0 ? (
        <p className="card p-8 text-center text-ink-500">No listings yet. Be the first to post in your area.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <section key={p.state} className="card p-5">
              <h2 className="flex items-baseline justify-between gap-2">
                <Link href={placePath(p.state)} className="font-display text-xl font-semibold hover:text-leaf-700">
                  {stateName(p.state)}
                </Link>
                <span className="text-sm text-ink-500">{p.count} listings</span>
              </h2>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                {p.cities.map((c) => (
                  <li key={c.city}>
                    <Link href={placePath(p.state, c.city)} className="text-ink-700 hover:text-leaf-700 hover:underline">
                      {c.city} <span className="text-ink-400">({c.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
