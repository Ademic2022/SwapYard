import type { ReactNode } from "react";

import { LogoMark } from "./icons";

const POINTS = [
  ["Borrow, don't buy", "Drills, ladders, tents. Use it for a weekend, hand it back."],
  ["Declutter in a day", "Neighbors a few streets away want what's in your store room."],
  ["Chat on WhatsApp", "One tap opens a chat with the listing already mentioned."],
];

/** Split layout for sign-in and onboarding: brand panel on large screens. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
      <aside className="relative hidden overflow-hidden rounded-[2rem] bg-leaf-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full bg-leaf-600" />
        <div aria-hidden="true" className="absolute -bottom-28 -left-16 size-72 rounded-full border-[28px] border-sun-500/30" />
        <LogoMark size={44} className="relative" />
        <div className="relative space-y-8">
          <h2 className="font-display text-4xl leading-tight font-semibold">
            Everything you need is probably <span className="text-sun-300 italic">three doors down.</span>
          </h2>
          <ul className="space-y-5">
            {POINTS.map(([title, body]) => (
              <li key={title} className="flex gap-4">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-sun-500" />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-leaf-100">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-leaf-200">Made for Nigerian estates, campuses and streets.</p>
      </aside>
      <div className="flex items-center justify-center py-4 lg:py-16">
        <div className="w-full max-w-md animate-rise">{children}</div>
      </div>
    </div>
  );
}
