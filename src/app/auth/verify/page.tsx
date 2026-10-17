import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/ui";

import { Verify } from "./Verify";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function VerifyPage() {
  return (
    <div className="pt-2">
      <Suspense fallback={<Spinner label="Checking your link" />}>
        <Verify />
      </Suspense>
    </div>
  );
}
