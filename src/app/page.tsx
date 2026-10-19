import { Feed } from "@/components/feed/Feed";
import { PopularPlaces } from "@/components/PopularPlaces";
import { getNewestListings } from "@/lib/public-data";

export default async function HomePage() {
  const newest = await getNewestListings();
  return (
    <div className="space-y-12">
      <Feed initialItems={newest} />
      <PopularPlaces />
    </div>
  );
}
