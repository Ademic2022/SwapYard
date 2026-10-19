import type { ListingDetailFieldsFragment } from "@/gql/graphql";

import { absoluteUrl, placePath, stateName } from "./seo";

const CONDITION: Record<string, string> = {
  NEW: "https://schema.org/NewCondition",
  LIKE_NEW: "https://schema.org/UsedCondition",
  GOOD: "https://schema.org/UsedCondition",
  FAIR: "https://schema.org/UsedCondition",
  FOR_PARTS: "https://schema.org/DamagedCondition",
};

function availability(l: ListingDetailFieldsFragment) {
  if (!l.isLive || l.status === "DONE") return "https://schema.org/SoldOut";
  return l.status === "RESERVED" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock";
}

/** Product (Buy & Sell, Borrow) or Service (Skills) structured data, plus breadcrumbs. */
export function listingSchema(l: ListingDetailFieldsFragment) {
  const url = absoluteUrl(`/l/${l.id}`);
  const images = l.photos.map((p) => absoluteUrl(p.url));
  const area = l.city ? { "@type": "Place", name: `${l.area ? `${l.area}, ` : ""}${l.city}, ${l.state}, Nigeria` } : undefined;
  const seller = { "@type": "Person", name: l.owner.displayName, url: absoluteUrl(`/u/${l.owner.id}`) };

  let main: Record<string, unknown>;
  if (l.category === "SKILL") {
    main = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: l.title,
      description: l.description,
      url,
      image: images,
      provider: seller,
      areaServed: area,
      ...(l.skillRateNgn
        ? { offers: { "@type": "Offer", price: l.skillRateNgn, priceCurrency: "NGN", availability: availability(l), url } }
        : {}),
    };
  } else {
    const price = l.category === "SELL" ? (l.isFree ? 0 : l.priceNgn ?? 0) : l.borrowFeePerDayNgn ?? 0;
    main = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: l.title,
      description: l.description,
      url,
      image: images,
      ...(l.condition ? { itemCondition: CONDITION[l.condition] } : {}),
      offers: {
        "@type": "Offer",
        url,
        price,
        priceCurrency: "NGN",
        availability: availability(l),
        seller,
        areaServed: area,
        ...(l.category === "BORROW"
          ? {
              businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
              priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "NGN", unitText: "day" },
            }
          : {}),
      },
    };
  }

  const crumbs = [
    { name: "SwapYard", path: "/" },
    ...(l.state ? [{ name: stateName(l.state), path: placePath(l.state) }] : []),
    ...(l.state && l.city ? [{ name: l.city, path: placePath(l.state, l.city) }] : []),
    { name: l.title, path: `/l/${l.id}` },
  ];
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
  return [main, breadcrumbs];
}
