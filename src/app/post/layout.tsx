import type { Metadata } from "next";

// Personal page: keep it out of search results.
export const metadata: Metadata = { title: "New listing", robots: { index: false, follow: false } };

export default function Layout({ children }: LayoutProps<"/post">) {
  return children;
}
