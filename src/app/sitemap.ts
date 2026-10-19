import type { MetadataRoute } from "next";

import { getListingIndex, getPlaceCounts } from "@/lib/public-data";
import { absoluteUrl, placePath } from "@/lib/seo";

// Every live listing and every state/LGA that has listings. Refreshed hourly by the cached
// data helpers, so new listings appear without a redeploy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, places] = await Promise.all([getListingIndex(), getPlaceCounts()]);

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/places"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/safety"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];

  for (const place of places) {
    pages.push({ url: absoluteUrl(placePath(place.state)), changeFrequency: "daily", priority: 0.7 });
    for (const { city } of place.cities) {
      pages.push({ url: absoluteUrl(placePath(place.state, city)), changeFrequency: "daily", priority: 0.7 });
    }
  }

  for (const listing of listings) {
    pages.push({
      url: absoluteUrl(`/l/${listing.id}`),
      lastModified: listing.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }
  return pages;
}
