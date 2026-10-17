# SwapYard

SwapYard is a hyper-local neighborhood marketplace. People discover tools to borrow, skills to trade and secondhand items to buy from neighbors nearby, then connect instantly on WhatsApp. No middlemen, just community commerce made simple.

This is the mobile-first web app: Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4, urql and GraphQL Code Generator. It talks to [SwapYard-server](https://github.com/Ademic2022/SwapYard-server).

## Local development

Start the API first (see the server README), then:

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. In development, sign-in links print in the Django console.

Next.js rewrites `/graphql`, `/api/csrf` and `/media/*` to Django. The browser only sees one origin, so the session cookie is first-party and no CORS setup is needed.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run codegen` | Regenerate `src/gql/` from `../SwapYard-server/schema.graphql` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

GraphQL documents live in `src/lib/documents.ts`. After editing them, or after the server schema changes, run `npm run codegen`.

## Pages

| Route | |
|---|---|
| `/` | Feed: category tabs, search, filters (radius, price, free only, condition), device location or neighborhood, follow-up banner |
| `/l/[id]` | Listing. Server-rendered Open Graph tags so links preview well on WhatsApp. Chat on WhatsApp, share, report, owner actions |
| `/post`, `/l/[id]/edit` | Listing form. Photos are compressed on the device before upload. Asks for a WhatsApp number if missing |
| `/login`, `/auth/verify` | Magic-link sign-in |
| `/onboarding` | Name, neighborhood, optional WhatsApp, or waitlist |
| `/activity` | "Did this go through?" and ratings |
| `/me` | My listings, profile, location, sign out, delete account |
| `/u/[id]` | Public profile with ratings and badges |
| `/safety`, `/privacy` | Safety tips, prohibited items, privacy summary |

## Production

Build with `npm ci && npm run build` and run `npm start` under PM2 or systemd behind Nginx. Set `NEXT_PUBLIC_SITE_URL` to the public origin and `API_INTERNAL_URL` to Gunicorn's address.
