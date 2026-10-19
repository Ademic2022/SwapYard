import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PlaceListingPage } from "@/components/PlaceListingPage";
import { GridSkeleton } from "@/components/ui";
import { getListingsIn, getPlaceCounts, resolvePlace } from "@/lib/public-data";
import { placePath, stateName } from "@/lib/seo";

type Props = PageProps<"/places/[state]/[city]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const place = await resolvePlace(stateSlug, citySlug);
  if (!place) return { title: "Area not found", robots: { index: false } };
  const count =
    (await getPlaceCounts()).find((p) => p.state === place.state)?.cities.find((c) => c.city === place.city)?.count ?? 0;
  const where = `${place.city}, ${place.state}`;
  return {
    title: `Borrow, buy and sell in ${where}`,
    description: `${count > 0 ? `${count} listings from neighbors in ${where}` : `The neighborhood marketplace for ${where}`}: tools to borrow, secondhand items for sale or free, and local skills. Chat on WhatsApp.`,
    alternates: { canonical: placePath(place.state, place.city) },
    robots: count > 0 ? undefined : { index: false, follow: true },
  };
}

async function CityContent({ stateSlug, citySlug }: { stateSlug: string; citySlug: string }) {
  const place = await resolvePlace(stateSlug, citySlug);
  if (!place) notFound();
  const [listings, counts] = await Promise.all([getListingsIn(place.state, place.city), getPlaceCounts()]);
  const siblings = (counts.find((p) => p.state === place.state)?.cities ?? []).filter((c) => c.city !== place.city);
  const where = `${place.city}, ${place.state}`;
  return (
    <PlaceListingPage
      title={`Borrow, buy and trade in ${where}`}
      intro={`See what neighbors in ${place.city} are lending, selling and offering: tools for a weekend, secondhand finds, free items and local services. Every listing is a WhatsApp message away.`}
      crumbs={[
        { name: "SwapYard", path: "/" },
        { name: "Areas", path: "/places" },
        { name: stateName(place.state), path: placePath(place.state) },
        { name: place.city, path: placePath(place.state, place.city) },
      ]}
      listings={listings}
      nearby={siblings.map((c) => ({ name: c.city, path: placePath(place.state, c.city), count: c.count }))}
      nearbyTitle={`Nearby in ${stateName(place.state)}`}
    />
  );
}

export default function CityPage({ params }: Props) {
  return (
    <Suspense fallback={<GridSkeleton />}>
      {params.then(({ state, city }) => <CityContent stateSlug={state} citySlug={city} />)}
    </Suspense>
  );
}
