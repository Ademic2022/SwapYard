import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/ui";

import { UserProfile } from "./UserProfile";

export const metadata: Metadata = { title: "Neighbor profile" };

export default function UserProfilePage({ params }: PageProps<"/u/[id]">) {
  return <Suspense fallback={<Spinner />}>{params.then(({ id }) => <UserProfile id={id} />)}</Suspense>;
}
