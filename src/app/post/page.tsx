"use client";

import { ListingForm } from "@/components/listing/ListingForm";
import { PageHeader, RequireAuth } from "@/components/ui";

export default function PostPage() {
  return (
    <RequireAuth next="/post">
      <PageHeader eyebrow="New listing" title="Share something with your neighbors" description="Takes about two minutes. You can edit or take it down anytime." />
      <ListingForm />
    </RequireAuth>
  );
}
