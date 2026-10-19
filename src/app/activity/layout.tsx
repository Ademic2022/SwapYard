import type { Metadata } from "next";

// Personal page: keep it out of search results.
export const metadata: Metadata = { title: "Activity", robots: { index: false, follow: false } };

export default function Layout({ children }: LayoutProps<"/activity">) {
  return children;
}
