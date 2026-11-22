# Stolos — authentication flow

The front end of a complete authentication flow for Stolos, built as a hiring case study: sign-in, sign-up, two-step verification and password reset, in French and English, as close as possible to the Figma design.

The auth server (Better Auth, Prisma, PostgreSQL), the test accounts, the design tokens and a few UI components were provided. The screens, their logic, the translations and the company-card endpoint were built for this case.

## What the case asked for

| Requirement | Where |
|---|---|
| Sign-in and sign-up in one card, with tabs, no page reload | `/fr/login` |
| Two-step screen in place of the form, adapted to the account: app, app + email, email only | `/fr/login`, after the password |
| Six code boxes: a pasted code fills them from the first box, typing advances, six digits start the check | two-step screen |
| Recovery code instead of the six digits, and back | two-step screen |
| 30-second resend countdown that stays right after a reload (email code and reset link) | two-step screen, `/fr/forgot-password` |
| Forgot password, confirmation, new password, clear errors for an invalid, expired or used link | `/fr/forgot-password`, `/fr/reset-password` |
| The reset email at `/email` | `/fr/email` |
| A page that shows the user is signed in, not reachable without a session | `/fr/account` |
| French and English through the URL, no language switcher | `/fr/*`, `/en/*` |
| Company cards from a server endpoint, sectors and statuses translated | `GET /api/companies?locale=fr` |
| Layout for 1920 × 1080 and 1400 × 900 | every screen |

## Provided and built

| Provided (unchanged unless noted) | Built for this case |
|---|---|
| Better Auth server and client: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts` | Every screen under `src/app/[locale]/`, and their components in `src/components/auth/` |
| Prisma schema, migration, seed and test accounts (`prisma/`, `src/lib/test-accounts.ts`) | The six-box `CodeInput` and the `TextField` wrapper in `src/components/ui/` |
| The `/code` helper page | Company card, background and `GET /api/companies` (`src/lib/companies.ts`) |
| Design tokens in `src/app/globals.css` (one `auth-glow` utility added) | French and English dictionaries (`*.content.ts`) and locale routing (`src/proxy.ts`) |
| `Button`, `Input`, `PasswordInput`, sectors (`SECTORS`, `SectorTag`), `CompanyStatus` | Session helpers (`src/lib/session.ts`), error screen, security headers (`next.config.ts`) |

The provided start page and root layout (`src/app/page.tsx`, `src/app/layout.tsx`) were replaced by the translated screens under `src/app/[locale]/`. The `/code` page, which stays outside them, got its own small root layout.

## Getting started

Requirements: [Bun](https://bun.sh) and Docker. Checked on Windows 11 with Bun 1.4.5 (the repo declares `bun@1.3.14`), Node.js 22.17, Docker 29.0 and Docker Compose 2.40.

```bash
bun install
cp .env.example .env
bun run db:setup   # starts Postgres in Docker (port 5433), applies the migration, generates the Prisma client, creates the test accounts
bun run dev        # then open http://localhost:3000/login
```

`bun install` reports a few blocked postinstall scripts: nothing more is needed, `db:setup` generates the Prisma client.

The app must run on **http://localhost:3000**: `BETTER_AUTH_URL` in `.env` is that address, and Better Auth refuses requests from any other origin. Free port 3000 first. The example values in `.env` work locally; use your own `BETTER_AUTH_SECRET` anywhere else.

| Command | What it does |
|---|---|
| `bun run db:up` | Starts the database container again (after a reboot, for example) |
| `bun run db:seed` | Puts the four test accounts back in their initial state |
| `bun run lint` | ESLint |
| `bun run build`, then `bun run start` | Production build, served on port 3000 |

## Test accounts

Password for all of them: `Stolos-Test-2026`. Each account with a second step also has recovery codes.

| Email | After the password |
|---|---|
| `none@example.com` | Straight to `/account` |
| `app@example.com` | Six-digit code from the authenticator app |
| `both@example.com` | App code, or a code sent by email on request ("Send a code by email") |
| `email@example.com` | Email code, sent automatically when the screen opens |

No real email is sent and no authenticator app is needed. Two development pages stand in for them:

- **`/code`** (provided): the current app code, the last email code, the recovery codes and the last reset link of every account.
- **`/fr/email`** or **`/en/email`**: the latest password-reset email, laid out as in the design, with the working link on its button.

Both are development tools. They expose codes and links of every account and must not be deployed.

## Routes

| URL | Screen |
|---|---|
| `/login` (also `/`, `/fr`, `/en`) | Redirects to `/fr/login` or `/en/login`: the stored locale, then the browser language, then French |
| `/{fr,en}/login` | Sign-in and sign-up tabs. The two-step screen and the recovery-code screen replace the form. A signed-in visitor is sent to `/account` |
| `/{fr,en}/forgot-password` | Email form, then the confirmation with "Resend the link" |
| `/{fr,en}/reset-password` | New password and confirmation (token from the link), or the invalid-link screen |
| `/{fr,en}/account` | Protected page: name, email, sign-out. Without a session: back to `/login` |
| `/{fr,en}/email` | Development mailbox (see above) |
| `/code` | Development helper (provided) |
| `GET /api/companies?locale=fr\|en` | The eight company cards behind the auth screens, in the requested language |
| `/api/auth/*` | Better Auth endpoints (provided, see below) |

## Decisions

| Decision | Why |
|---|---|
| Cache Components, with request data behind `<Suspense>` | The frame of each page (background, logo, card) is prerendered and shows at once. Only what reads the request (cookies, query string, database) waits, in its own boundary. |
| Session checked in a server function (`src/lib/session.ts`), called by the pages | Better Auth checks the signed cookie against the database. A check in the proxy would only see that a cookie exists: a forged one would loop between `/login` and `/account`. |
| Pending two-step sign-in kept in `sessionStorage` | The email, the methods and the send times survive a reload; a new tab starts from the form. Never the password. Values are checked with Zod when read. |
| Countdowns computed from a stored time | The store keeps when the server accepted the last code or link. The seconds left are recomputed from the clock, so they stay right after a reload or in a background tab. A 429 realigns them from `X-Retry-After`. |
| One Zod source for the password rules | `createNewPasswordSchema` (8 to 128 characters, confirmation equal) serves sign-up and reset. The schemas take the translated messages, so errors follow the page language. |
| Intlayer in strict mode, locale in every URL | A dictionary that misses French or English fails type-checking. `/fr/*` and `/en/*` set `<html lang>`. |
| Name derived from the email at sign-up | The server requires a `name`, the design has no field: the part before `@`, dots and underscores turned into spaces, never empty. |
| Company cards from `GET /api/companies` | The data sits in a server-only module. The client reads it with TanStack Query, the locale in the cache key. Sector names and statuses come from the dictionaries. |
| App + email accounts: email code first, then app code | Once an email code was sent, the six digits are tried as an email code, then as an app code. |
| Forms with `method="post"`, security headers in `next.config.ts` | A form sent before the page has loaded its scripts never puts the password in the URL. Other sites cannot frame the pages, and the reset routes send no `Referer`. |

## How it was verified

| What | How |
|---|---|
| Design | Headless Chrome screenshots at 1920 × 1080 compared with the Figma PNG exports (19 November snapshot), by measuring positions on both images and diffing pixels. On the sign-in screen, the card, logo and background cards are within 0 to 2 px of the design. The exceptions are listed in Known limits. |
| Other sizes | 1400 × 900, 1280 to 1600 px wide, 1024 × 768 and 390 × 844: no horizontal scroll, no cut text, no overlap between the background cards and the card. |
| Behaviour | Scripts in headless Chrome for every flow, in French and English: the four accounts, paste into any box, wrong and expired codes, resend before 30 s, reload during a countdown, recovery codes (reuse refused), invalid, expired and used reset links, sign-out then Back. |
| Server side | `curl` on `/account` with no cookie, a forged cookie, an expired session and a cookie replayed after sign-out: never any user data, no redirect loop. |
| Accessibility | Keyboard-only runs (Tab order, visible focus), contrast measured on screen, names and live regions checked in the accessibility tree. |
| Fresh clone | A clone in an empty folder, with an empty database and only the commands of Getting started: install, setup, dev, lint, build and start all worked, and every flow above passed on the production build. |
| Attack pass | On localhost only: rate limits, account enumeration, open redirects, two-step bypass, XSS, secrets in the client files. The results are in Known limits. |

These checks used throwaway scripts kept outside the repository. There is no automated test suite.

## Provided auth API

Use `authClient`. Each method maps to an endpoint under `/api/auth`.

| Action | Client call | Endpoint | Notes |
|---|---|---|---|
| Sign up | `authClient.signUp.email({ name, email, password })` | `POST /sign-up/email` | Signs the user in. Password: 8 characters minimum. |
| Sign in | `authClient.signIn.email({ email, password })` | `POST /sign-in/email` | With a second step: `{ twoFactorRedirect: true, twoFactorMethods }`, with `"totp"` (app) and/or `"otp"` (email). |
| Verify app code | `authClient.twoFactor.verifyTotp({ code })` | `POST /two-factor/verify-totp` | |
| Send email code | `authClient.twoFactor.sendOtp()` | `POST /two-factor/send-otp` | A new code cancels the previous one. Codes expire after 3 minutes. |
| Verify email code | `authClient.twoFactor.verifyOtp({ code })` | `POST /two-factor/verify-otp` | |
| Verify recovery code | `authClient.twoFactor.verifyBackupCode({ code })` | `POST /two-factor/verify-backup-code` | Each code works once. |
| Ask for a reset link | `authClient.requestPasswordReset({ email, redirectTo })` | `POST /request-password-reset` | Same answer whether the account exists or not. A new link cancels the previous one. |
| The reset link | — | `GET /reset-password/:token` | Redirects to `redirectTo?token=…`, or `?error=INVALID_TOKEN`. |
| Set the new password | `authClient.resetPassword({ newPassword, token })` | `POST /reset-password` | |
| Current session | `authClient.getSession()`, `authClient.useSession()` | `GET /get-session` | |
| Sign out | `authClient.signOut()` | `POST /sign-out` | |

Errors come back as `{ error: { status, code, message } }`.

| Case | Status | `code` |
|---|---|---|
| Wrong email or password | 401 | `INVALID_EMAIL_OR_PASSWORD` |
| Email already used at sign-up | 422 | `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` |
| Wrong or expired code | 401 | `INVALID_CODE` |
| Sign-in attempt expired (10 minutes) | 401 | `INVALID_TWO_FACTOR_COOKIE` |
| Reset link invalid, expired or already used | 400 | `INVALID_TOKEN` |
| Too many requests | 429 | none: the `X-Retry-After` header gives the seconds to wait |

The server refuses a new email code or a new reset link for 30 seconds after the previous one (429). Sign-in is limited to 3 attempts per 10 seconds.

## How this was built

I used an AI coding assistant (Claude Code) throughout, as the brief allows. I reviewed each step before committing it, tested it by hand, and can explain every file.

## Known limits

What the front end leaves out or does differently from the design, and what the provided server leaves open. Figures come from the production build on localhost.

### Design and layout

- The two-step screens have a "Back to sign in" link that is not in the design. It makes the card 24 px taller and moves its top 12 px up.
- Every screen keeps the card centre at y = 606 px (1920 × 1080). The two-step cards therefore start 13 to 22 px higher than in their design frames, 25 to 34 px with the link.
- The provided `Input` and `PasswordInput` keep their own look (darker field, 18 px floating label, open-eye icon), unlike the 19 November Figma snapshot.
- Below 1280 px wide, the company cards are hidden.
- On a phone, the six code boxes shrink (about 37 × 57 px at 390 px wide) instead of overflowing the card.
- At 1024 × 768 and 390 × 844, the sign-in page scrolls vertically. The background stays in place.
- "Terms of use" and "Privacy policy" under the sign-in card are plain text: those pages do not exist.
- An unknown URL shows the default Next.js 404 page: English only, no `lang` attribute.

### Accessibility

- Below the WCAG AA contrast of 4.5:1: the floating labels of the provided inputs (3.75:1) and the active tab label (3.8:1).
- The greyed "Resend" link during a countdown measures 2.5:1. It is disabled, which WCAG exempts.
- A disabled "Resend" link cannot take the focus, so a screen reader does not announce the countdown.
- The spinner of the provided `Button` keeps turning when the system asks for reduced motion.

### Behaviour

- After a reload, a pending two-step sign-in and the reset-link confirmation first show their form for a few frames: the prerendered page cannot read `sessionStorage` on the server.
- On `/login`, a signed-in visitor sees the sign-in form for about 0.1 s before landing on `/account`: the session check streams in after the prerendered page.
- If the database is down and the browser has a session cookie, `/login` shows the error screen instead of the form.
- "Back to sign in" forgets the attempt in this tab only. The server's two-step cookie stays until it expires (10 minutes) or the next sign-in replaces it.
- Countdowns are kept per tab. Another tab starts without one; if it asks too early, the server's 429 starts the countdown there.
- For an app + email account, once an email code was sent, a wrong code is refused twice (email, then app): the account locks after 5 wrong codes instead of 10.
- A real double click sends one request. Two clicks fired by a script in the same task send two, and the server refuses the second.
- One generic error screen ("Something went wrong", "Try again") covers every server failure.
- The Content-Security-Policy does not restrict scripts: that needs a nonce per request, which prerendered pages cannot carry. It blocks framing by other sites, `<base>` changes, plugins and form posts to other sites.

### Development-only pages

- `/email` shows the latest password-reset email of any account, with its working link. It stands in for a mailbox.
- `/code` (provided) shows the test password, the current codes, the recovery codes and the reset links of every account.

### Provided server (not changed)

- Rate limits trust the client's `X-Forwarded-For` header (Better Auth default). A new value on each request removes them: 6 wrong passwords in a row all got 401, never 429, and 4 reset-link requests in a row were all accepted. Behind a proxy, set `advanced.ipAddress` (`ipAddressHeaders`, `trustedProxies`).
- Without any client IP, all visitors share one rate-limit bucket per endpoint: one client can block sign-in for everyone, 10 seconds at a time.
- Wrong passwords never lock an account. Only failed two-step checks do (10 failures, 15 minutes).
- No replay check on app codes: the same code was accepted for two sign-in attempts in a row.
- A reset-link request answers the same for a known and an unknown email, but not in the same time: median 16 ms against 5 ms.
- Sign-up answers 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` for an email that is already registered.
- A password reset does not sign out the account's other sessions (`revokeSessionsOnPasswordReset` is off).
- Cookies are `HttpOnly`, `SameSite=Lax` and `Path=/` (session: 7 days; two-step attempt: 10 minutes), but not `Secure`, because `BETTER_AUTH_URL` starts with `http://`. With an `https://` URL, Better Auth adds `Secure` and the `__Secure-` prefix.
- Reset links and their redirects use `BETTER_AUTH_URL` (`http://localhost:3000`), whatever port the app runs on.
