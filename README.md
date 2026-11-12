# Neario ReviewFlow

Customer feedback and Google reviews for small local businesses (salons, clinics, cafés, shops).
A customer scans a QR code or taps a stand, rates the visit in English, Hindi or Kannada, and can add a
note. The business sees it on its dashboard. After sending feedback, **every** customer is offered the
same Google review link, whatever their rating (no review gating).

- Live: https://nearioreviewflow.glcdemo.workers.dev
- Stack: Next.js 15 (App Router, JavaScript, React 19) on Cloudflare Workers via OpenNext,
  Neon serverless Postgres, lucide-react icons, Framer Motion (step transitions only).
- Design system and writing rules: [DESIGN.md](DESIGN.md)

## How it fits together

| Area | Path | Who |
|---|---|---|
| Marketing site | `/`, `/how`, `/features`, `/agencies`, `/pricing`, `/honest`, `/faq`, `/start` (one page, section URLs) | Public |
| Customer feedback page | `/feedback/[businessId]` (the QR target) | Public |
| Sign in / set password | `/login`, `/accept?token=…` | Owners, agencies, Neario staff |
| Setup wizard | `/onboarding` | Business owners |
| Dashboard | `/dashboard` (`?b=<id>` opens one business) | Owners, agencies, Neario staff |
| Admin console | `/admin` | Neario super admin |
| Sample-data demo | `/demo/*` (static prototype in `public/demo-app.html`) | Public |
| Privacy / Terms | `/privacy`, `/terms` | Public |

**Roles.** `super_admin` (Neario), `agency_user` (sees only its own clients), `client_user` (one business).
All visibility rules live in one place, `businessScope()` in [lib/service.js](lib/service.js).
Every time an agency or Neario opens a client's feedback, a row is written to `view_log`, and the owner can see it.

**Onboarding pipeline.** Website sign-up form → `leads` → admin clicks *Create account* → business + invite
link → owner sets a password at `/accept` → `/onboarding` (name, services, Google review link, QR code) → dashboard.

**API.** Route handlers in `app/api/**` are thin wrappers (`handle()` in [lib/http.js](lib/http.js)) around
`lib/service.js`. `handle()` checks the session cookie, refuses cross-site writes, rate-limits public and
auth writes ([lib/ratelimit.js](lib/ratelimit.js)), and never leaks server error details.

| Endpoint | Auth |
|---|---|
| `GET/POST /api/feedback/:businessId` | Public (CORS `*`), POST rate limited |
| `POST /api/leads` | Public, same-site, rate limited · `GET` super admin |
| `POST /api/auth/login`, `POST /api/invites/accept` | Public, rate limited |
| `POST /api/auth/logout`, `GET /api/me` | Session |
| `GET/POST /api/businesses`, `GET/PATCH /api/businesses/:id`, `GET /api/businesses/:id/feedback` | Session, scoped |
| `GET/POST /api/agencies`, `POST /api/leads/:id/convert`, `POST /api/leads/:id/dismiss` | Super admin |
| `POST /api/invites/resend`, `POST /api/invites/send-email` | Super admin or the client's agency |
| `GET /api/view-log` | Session, scoped |
| `GET /api/health` | Public, returns only `{ ok }` |

## Local setup

Requirements: Node 20+ (tested on 22) and a Neon (or any Postgres) database.

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL and SESSION_SECRET
npm run migrate               # creates/updates tables (safe to re-run)
SUPER_ADMIN_EMAIL=you@example.com SUPER_ADMIN_PASSWORD='a-long-password' npm run seed
npm run dev                   # http://localhost:3000
```

Without a database the public pages, the demo and the demo customer page (`/feedback/demo`) still work;
signed-in pages need the database.

## Environment variables

Names only; see [.env.example](.env.example) for what each does.

| Name | Required | Where |
|---|---|---|
| `DATABASE_URL` | Yes | Cloudflare secret, `.env` |
| `SESSION_SECRET` | Yes (≥ 32 chars) | Cloudflare secret, `.env` |
| `NEXT_PUBLIC_SITE_URL` | No | Build-time variable |
| `GMAIL_WEBHOOK_URL`, `GMAIL_WEBHOOK_SECRET` | No (invite email, option 1) | Cloudflare secrets |
| `RESEND_API_KEY`, `EMAIL_FROM` | No (invite email, option 2) | Cloudflare secrets |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_NAME` | `npm run seed` only | Shell |
| `VERIFY_ADMIN_EMAIL`, `VERIFY_ADMIN_PASSWORD`, `ALLOW_INTEGRATION_WRITES` | `npm run test:integration` only | `.env.test` |

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Next.js production build |
| `npm run lint` | ESLint (Next core-web-vitals rules) |
| `npm run test:unit` | Tests that need no database (QR encoder: every generated code is decoded back) |
| `npm test` | All tests, including the access-control suites, which need an empty throwaway Postgres reachable with `psql` (set `PSQL_ARGS`, e.g. `-h localhost -U postgres neario_test`) |
| `npm run build:worker` | OpenNext build for Cloudflare (`.open-next/`) |
| `npm run preview` | Build the worker and run it locally with wrangler |
| `npm run deploy` | Build the worker and deploy to Cloudflare |
| `npm run migrate` | Apply `lib/schema.sql` |
| `npm run seed` | Create the first super admin |
| `npm run test:integration` | End-to-end API check. **Writes data**: only run against a throwaway database, with `.env.test` and `ALLOW_INTEGRATION_WRITES=1` |

## Deploying to Cloudflare

Config lives in [wrangler.jsonc](wrangler.jsonc): `nodejs_compat`, static assets binding, a self-reference
service binding used by OpenNext, observability, and two rate-limit bindings (`AUTH_LIMITER`,
`PUBLIC_WRITE_LIMITER`; their `namespace_id`s must be unique in your account).

**From your machine**

```bash
npx wrangler login
npx wrangler secret put DATABASE_URL
npx wrangler secret put SESSION_SECRET
# optional: GMAIL_WEBHOOK_URL / GMAIL_WEBHOOK_SECRET or RESEND_API_KEY / EMAIL_FROM
npm run migrate        # against the production DATABASE_URL, once per schema change
npm run deploy
```

**With Cloudflare Workers Builds (Git integration)**

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`
- Build variable: `SKIP_OPENNEXT_POSTINSTALL=1` (otherwise the `postinstall` hook builds the worker a second time)
- Secrets: set `DATABASE_URL` and `SESSION_SECRET` (and email secrets) under the Worker's *Settings → Variables and Secrets*.

After deploying, check `https://<your-host>/api/health` returns `{"ok":true}`.

## Security notes

- Sessions: HMAC-signed, HttpOnly, SameSite=Lax, Secure in production, 7 days. Passwords: scrypt.
  Five wrong passwords lock an account for 15 minutes.
- Invite tokens are single use, stored only as SHA-256 hashes, and expire after 7 days. Lost or expired
  invites: *Create a new invite link* in the admin console.
- Security headers (CSP, HSTS, frame denial, Permissions-Policy) are set in [next.config.mjs](next.config.mjs).
- There is no self-service password reset yet; owners ask Neario or their agency for a new invite link.

## Project layout

```
app/                 routes (pages + API), shared UI in app/components/ui
app/components/      landing page, QR code, cookie notice, demo loader
lib/                 db (Neon), auth (sessions, passwords), service (all business rules), qr, rate limiting
lib/schema.sql       database schema (idempotent)
public/demo-app.html static sample-data dashboard used by /demo
scripts/             migrate, seed, integration check, Cloudflare postinstall hook
test/                node:test suites
```
