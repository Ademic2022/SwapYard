import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PlaceListingPage } from "@/components/PlaceListingPage";
import { GridSkeleton } from "@/components/ui";
import { getListingsIn, getPlaceCounts, resolvePlace } from "@/lib/public-data";
import { placePath, stateName } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/places/[state]">): Promise<Metadata> {
  const { state: slug } = await params;
  const place = await resolvePlace(slug);
  if (!place) return { title: "Area not found", robots: { index: false } };
  const count = (await getPlaceCounts()).find((p) => p.state === place.state)?.count ?? 0;
  const name = stateName(place.state);
  return {
    title: `Borrow, buy and sell in ${name}`,
    description: `${count > 0 ? `${count} listings from neighbors in ${name}` : `The neighborhood marketplace for ${name}`}: tools to borrow, secondhand items, and local skills. Chat on WhatsApp.`,
    alternates: { canonical: placePath(place.state) },
    // Empty areas stay reachable but out of search results until they have listings.
    robots: count > 0 ? undefined : { index: false, follow: true },
  };
}

async function StateContent({ slug }: { slug: string }) {
  const place = await resolvePlace(slug);
  if (!place) notFound();
  const [listings, counts] = await Promise.all([getListingsIn(place.state), getPlaceCounts()]);
  const cities = counts.find((p) => p.state === place.state)?.cities ?? [];
  const name = stateName(place.state);
  return (
    <PlaceListingPage
      title={`Borrow, buy and trade in ${name}`}
      intro={`Neighbors across ${name} lend tools, sell what they no longer need and offer their skills. Browse the latest listings, or narrow it down to your local government area.`}
      crumbs={[
        { name: "SwapYard", path: "/" },
        { name: "Areas", path: "/places" },
        { name: name, path: placePath(place.state) },
      ]}
      listings={listings}
      nearby={cities.map((c) => ({ name: c.city, path: placePath(place.state, c.city), count: c.count }))}
      nearbyTitle={`Local government areas in ${name}`}
    />
  );
}

export default function StatePage({ params }: PageProps<"/places/[state]">) {
  return (
    <Suspense fallback={<GridSkeleton />}>{params.then(({ state }) => <StateContent slug={state} />)}</Suspense>
  );
}
