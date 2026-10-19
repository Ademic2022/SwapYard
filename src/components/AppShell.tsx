"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { BellIcon, HomeIcon, LogoMark, PlusIcon, ShieldIcon, UserIcon } from "./icons";
import { useMe } from "./Providers";
import { Avatar } from "./ui";

const NAV = [
  { href: "/", label: "Discover", Icon: HomeIcon },
  { href: "/activity", label: "Activity", Icon: BellIcon },
  { href: "/me", label: "Me", Icon: UserIcon },
];

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="SwapYard home">
      <LogoMark className="transition group-hover:-rotate-6" />
      <span className="font-display text-[1.35rem] font-semibold text-leaf-800">SwapYard</span>
    </Link>
  );
}

function isActive(pathname: string | null, href: string) {
  if (pathname === null) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// The current path is runtime data, so the highlighted nav streams in after
// the prerendered shell; the fallback is the same nav with nothing highlighted.
function WithPathname({ render }: { render: (pathname: string | null) => ReactNode }) {
  return (
    <Suspense fallback={render(null)}>
      <PathnameReader render={render} />
    </Suspense>
  );
}

function PathnameReader({ render }: { render: (pathname: string | null) => ReactNode }) {
  return render(usePathname());
}

function TopNav({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {NAV.slice(0, 2).map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className="relative rounded-full px-4 py-2 text-sm font-semibold text-ink-500 transition hover:text-ink-900 aria-[current=page]:bg-ink-100 aria-[current=page]:text-ink-900"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function AccountArea() {
  const { me, loading } = useMe();
  if (loading) return <span className="size-9 rounded-full skeleton" aria-hidden="true" />;
  if (!me) {
    return (
      <Link href="/login" className="btn-secondary min-h-10 px-4">
        Sign in
      </Link>
    );
  }
  return (
    <Link href="/me" className="rounded-full ring-2 ring-transparent transition hover:ring-leaf-200" aria-label="Your account">
      <Avatar name={me.displayName || me.email} url={me.photoUrl} size={38} />
    </Link>
  );
}

function BottomNav({ pathname }: { pathname: string | null }) {
  // Five slots keep the Post button centered.
  const items = [
    NAV[0],
    NAV[1],
    { href: "/post", label: "Post", Icon: PlusIcon },
    { href: "/safety", label: "Safety", Icon: ShieldIcon },
    NAV[2],
  ];
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-[1.75rem] bg-leaf-900/95 px-2 shadow-float backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          if (href === "/post") {
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  aria-label="Post a listing"
                  className="-mt-5 grid size-14 place-items-center rounded-full bg-sun-500 text-ink-900 shadow-lift ring-4 ring-paper transition active:scale-95"
                >
                  <Icon width={24} height={24} strokeWidth={2.2} />
                </Link>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold tracking-wide transition ${
                  active ? "text-sun-300" : "text-leaf-200/70 hover:text-white"
                }`}
              >
                <Icon width={22} height={22} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-200/60 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo />
          <WithPathname render={(pathname) => <TopNav pathname={pathname} />} />
          <div className="ml-auto flex items-center gap-3">
            <Link href="/post" className="btn-primary hidden md:inline-flex">
              <PlusIcon width={18} height={18} strokeWidth={2.2} /> Post a listing
            </Link>
            <AccountArea />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-32 sm:px-6 md:pb-16">{children}</main>

      <footer className="hidden border-t border-ink-200/60 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-ink-500">
          <p>
            <span className="font-display font-semibold text-ink-700">SwapYard</span> · Borrow, buy and trade with
            neighbors.
          </p>
          <div className="flex gap-6">
            <Link href="/places" className="hover:text-ink-900">
              Browse by area
            </Link>
            <Link href="/safety" className="hover:text-ink-900">
              Safety
            </Link>
            <Link href="/privacy" className="hover:text-ink-900">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

      <WithPathname render={(pathname) => <BottomNav pathname={pathname} />} />
    </>
  );
}
