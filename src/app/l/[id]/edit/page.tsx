import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/ui";

import { EditListingClient } from "./EditListing";

export const metadata: Metadata = { title: "Edit listing", robots: { index: false } };

export default function EditListingPage({ params }: PageProps<"/l/[id]/edit">) {
  return (
    <Suspense fallback={<Spinner />}>{params.then(({ id }) => <EditListingClient id={id} />)}</Suspense>
  );
}
