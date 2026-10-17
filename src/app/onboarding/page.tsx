import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthLayout } from "@/components/AuthLayout";
import { Spinner } from "@/components/ui";

import { Onboarding } from "./Onboarding";

export const metadata: Metadata = { title: "Set up your profile" };

export default function OnboardingPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<Spinner />}>
        <Onboarding />
      </Suspense>
    </AuthLayout>
  );
}
