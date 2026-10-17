import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SwapYard: borrow, buy and trade with neighbors",
    template: "%s · SwapYard",
  },
  description:
    "Find tools to borrow, skills to trade and secondhand items to buy from neighbors nearby, then chat on WhatsApp.",
  openGraph: { siteName: "SwapYard", type: "website", locale: "en_NG" },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
