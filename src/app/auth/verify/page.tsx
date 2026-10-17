import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/ui";

import { Verify } from "./Verify";

export const metadata: Metadata = { title: "Signing in", robots: { index: false } };

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-sm pt-6">
      <Suspense fallback={<Spinner label="Signing you in" />}>
        <Verify />
      </Suspense>
    </div>
  );
}
