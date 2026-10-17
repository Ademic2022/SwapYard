import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthLayout } from "@/components/AuthLayout";
import { Spinner } from "@/components/ui";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<Spinner />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
