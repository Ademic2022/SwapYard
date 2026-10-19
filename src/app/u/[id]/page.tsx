import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/JsonLd";
import { Spinner } from "@/components/ui";
import { UserQuery } from "@/lib/documents";
import { absoluteUrl } from "@/lib/seo";
import { serverQuery } from "@/lib/server-api";

import { UserProfile } from "./UserProfile";

type Props = PageProps<"/u/[id]">;

async function getProfile(id: string) {
  return (await serverQuery(UserQuery, { id }))?.user ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getProfile(id);
  if (!user) return { title: "Profile not available", robots: { index: false } };
  const where = user.locationLabel ? ` in ${user.locationLabel}` : "";
  const listings = user.activeListings.length;
  return {
    title: `${user.displayName}${where}`,
    description: `${user.displayName} is a SwapYard neighbor${where}${
      listings ? ` with ${listings} active listing${listings === 1 ? "" : "s"}` : ""
    }. See what they're lending, selling and offering.`,
    alternates: { canonical: `/u/${user.id}` },
    // Profiles with nothing listed add little for searchers.
    robots: listings > 0 ? undefined : { index: false, follow: true },
  };
}

async function ProfileLoader({ id }: { id: string }) {
  const user = await getProfile(id);
  return (
    <>
      {user && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: user.displayName,
              url: absoluteUrl(`/u/${user.id}`),
              ...(user.photoUrl ? { image: absoluteUrl(user.photoUrl) } : {}),
              ...(user.locationLabel ? { homeLocation: { "@type": "Place", name: `${user.locationLabel}, Nigeria` } } : {}),
            },
          }}
        />
      )}
      <UserProfile id={id} initial={user} />
    </>
  );
}

export default function UserProfilePage({ params }: Props) {
  return <Suspense fallback={<Spinner />}>{params.then(({ id }) => <ProfileLoader id={id} />)}</Suspense>;
}
