# Stolos — authentication exercise

Starter for the front-end exercise. The back end is ready: you build the screens from the Figma file on top of it.

Stack: Next.js (App Router), Better Auth, Prisma + PostgreSQL, Tailwind. `react-hook-form` and `@tanstack/react-query` are installed.

## Setup

Requires [Bun](https://bun.sh) and Docker.

```bash
bun install
cp .env.example .env
bun run db:setup   # starts Postgres on port 5433, applies migrations, creates the test accounts
bun run dev
```

`bun run db:seed` puts the test accounts back in their initial state at any time.

## What is provided

| File | Role |
|---|---|
| `src/lib/auth.ts` | Better Auth server configuration |
| `src/lib/auth-client.ts` | Better Auth client (`authClient`), with the two-factor plugin |
| `src/app/api/auth/[...all]/route.ts` | All auth endpoints, under `/api/auth` |
| `src/app/code/page.tsx` | The `/code` helper page (see below) |
| `src/app/globals.css` | Stolos design tokens (colors, text sizes, spacing, radii) and the `glassmorphism` utility |
| `src/components/ui/` | `Button`, `Input`, `PasswordInput`, copied from the Stolos web app |
| `src/components/sectors/` | Company sectors from the Stolos web app: list, colours and icons (`sectors.ts`) and the `SectorTag` component. Sector names are not translated: that is part of the exercise. The rest of the company card is yours to build. |
| `src/components/company/company-status.ts` | Company statuses from the Stolos web app (`CompanyStatus`) |
| `src/app/page.tsx` | Start page: preview of these building blocks, to replace with your screens |

The tokens redefine part of Tailwind's scale: `text-xs` … `text-xl` follow the Stolos sizes, and the spacing names (`xs`, `s`, `sm`, `m`, `l`, `xl`, `2xl`, `3xl`, `4xl`) also apply to sizing utilities, so `max-w-xl` is 1.5rem. Use explicit values such as `max-w-[36rem]` for widths.

No real email is sent and no authenticator app is needed. Open **`/code`** in another tab: for every account it shows the current authenticator code, the last code "sent by email", the recovery codes and the last password-reset link.

## Routes

| Path | What it is |
|---|---|
| `/` | Start page: preview of the provided building blocks. Replace it with your screens. |
| `/code` | Helper page: codes, recovery codes and reset links of every account (see above). |
| `/api/auth/*` | Auth endpoints served by Better Auth, listed below. |

No other page exists yet: sign-in, sign-up, verification and password-reset pages are yours to create, at the paths you choose.

| Method | Path | Action |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Sign up |
| POST | `/api/auth/sign-in/email` | Sign in |
| POST | `/api/auth/two-factor/verify-totp` | Verify app code |
| POST | `/api/auth/two-factor/send-otp` | Send email code |
| POST | `/api/auth/two-factor/verify-otp` | Verify email code |
| POST | `/api/auth/two-factor/verify-backup-code` | Verify recovery code |
| POST | `/api/auth/request-password-reset` | Ask for a reset link |
| GET | `/api/auth/reset-password/:token` | The reset link itself: redirects to `redirectTo?token=…` |
| POST | `/api/auth/reset-password` | Set the new password |
| GET | `/api/auth/get-session` | Current session |
| POST | `/api/auth/sign-out` | Sign out |

## Test accounts

Password for all of them: `Stolos-Test-2026`

| Email | Second step at sign-in |
|---|---|
| `none@example.com` | none |
| `app@example.com` | authenticator app |
| `both@example.com` | authenticator app or email code |
| `email@example.com` | email code |

Every account with a second step also has recovery codes.

## Auth API

Use `authClient`; each method maps to an endpoint under `/api/auth`.

| Action | Client call | Notes |
|---|---|---|
| Sign up | `authClient.signUp.email({ name, email, password })` | Signs the user in. Password: 8 characters minimum. |
| Sign in | `authClient.signIn.email({ email, password })` | With a second step, returns `{ twoFactorRedirect: true, twoFactorMethods }` instead of a session. `twoFactorMethods` contains `"totp"` (app) and/or `"otp"` (email). |
| Verify app code | `authClient.twoFactor.verifyTotp({ code })` | |
| Send email code | `authClient.twoFactor.sendOtp()` | A new code cancels the previous one. Codes expire after 3 minutes. |
| Verify email code | `authClient.twoFactor.verifyOtp({ code })` | |
| Verify recovery code | `authClient.twoFactor.verifyBackupCode({ code })` | Each code works once. |
| Ask for a reset link | `authClient.requestPasswordReset({ email, redirectTo: "/your-page" })` | Same answer whether the account exists or not. A new link cancels the previous one. |
| Set the new password | `authClient.resetPassword({ newPassword, token })` | The link on `/code` redirects to `redirectTo?token=…`. |
| Current session | `authClient.useSession()` / `authClient.getSession()` | |
| Sign out | `authClient.signOut()` | |

### Errors to handle

Errors come back as `{ error: { status, code, message } }`.

| Case | Status | `code` |
|---|---|---|
| Wrong email or password | 401 | `INVALID_EMAIL_OR_PASSWORD` |
| Email already used at sign-up | 422 | `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` |
| Wrong or expired code | 401 | `INVALID_CODE` |
| Sign-in attempt expired (10 minutes) | 401 | `INVALID_TWO_FACTOR_COOKIE` |
| Reset link invalid, expired or already used | 400 | `INVALID_TOKEN` |
| Too many requests | 429 | — the `X-Retry-After` response header gives the seconds to wait |

The server refuses a new email code or a new reset link for **30 seconds** after the previous request (429). Sign-in is limited to 3 attempts per 10 seconds.

## Known limits

What the front end leaves out or does differently from the design, and what the provided server leaves open. Figures come from the production build (`bun run build`, then `bun run start`) on localhost.

### Design and layout

- The six-box screens have a "Back to sign in" link that is not in the design. It makes the card 24 px taller, so its top sits 12 px higher.
- All screens keep the card centre at y = 606 px on a 1920 × 1080 screen. The two-factor screens therefore sit about 16 px higher than in their design frames.
- The provided `Input` and `PasswordInput` keep their own look (darker field, 18 px floating label, open-eye icon). The Figma frames, a snapshot of 19 November, show a slightly different field.
- Below 1280 px wide, the company cards are hidden. On a phone, the six code boxes shrink (about 37 × 57 px at 390 px wide) instead of overflowing the card.
- An unknown URL shows the default Next.js 404 page: English only, without a `lang` attribute.

### Accessibility

- Two texts are below the WCAG AA contrast of 4.5:1: the floating labels of the provided inputs (3.75:1) and the active tab label (3.8:1). The greyed "Resend" link during the 30-second countdown measures 2.5:1, but it is disabled, which WCAG exempts.
- A disabled "Resend" link cannot take the keyboard focus, so a screen reader user does not hear the countdown until the link is enabled again.
- The loading spinner of the provided `Button` keeps spinning when the system asks for reduced motion.

### Behaviour

- On `/login`, a signed-in visitor first sees the sign-in form for about 0.1 s, then lands on `/account`: the session check streams in after the prerendered page.
- If the database is down and the browser has a session cookie, `/login` shows the error screen instead of the form.
- "Back to sign in" forgets the sign-in attempt in this tab only. The server's two-factor cookie stays until it expires (10 minutes) or until the next sign-in replaces it.
- A real double click sends one request. Two clicks fired by a script in the same task send two, and the server refuses the second (single-use codes and tokens, rate limits).
- One generic error screen ("Something went wrong", "Try again") covers every server failure.
- The Content-Security-Policy does not restrict scripts: a strict script policy needs a nonce per request, and prerendered pages cannot carry one. It only blocks framing by other sites, `<base>` changes, plugins and form posts to other sites.

### Development-only pages

- `/email` shows the latest password-reset email of any account, with its working link. It stands in for a mailbox and must not be deployed.
- `/code` (provided) shows the test password, the current codes, the recovery codes and the reset links of every account.

### Provided server (not changed in this project)

- The rate limits trust the client's `X-Forwarded-For` header (the Better Auth default). A new value on each request removes them: 6 wrong passwords in a row all got 401 instead of 429, and 4 reset-link requests in a row were all accepted. Behind a proxy, set `advanced.ipAddress` (`ipAddressHeaders`, `trustedProxies`) to the header the proxy writes.
- Without any client IP, all visitors share one rate-limit bucket per endpoint: one client can block sign-in for everyone, 10 seconds at a time.
- Wrong passwords never lock an account. Only failed two-factor checks do (10 failures, 15 minutes).
- The same authenticator code was accepted for two sign-in attempts in a row: there is no replay check.
- A reset-link request gives the same answer for a known and an unknown email, but not in the same time: median 16 ms for a known email, 5 ms for an unknown one.
- Sign-up answers 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` for an email that is already registered.
- A password reset does not sign out the account's other sessions (`revokeSessionsOnPasswordReset` is off).
- Cookies are `HttpOnly`, `SameSite=Lax` and `Path=/` (session: 7 days; two-factor attempt: 10 minutes). They are not `Secure` because `BETTER_AUTH_URL` starts with `http://`. With an `https://` URL, Better Auth marks them `Secure` and adds the `__Secure-` prefix.
- Reset links and their redirects use `BETTER_AUTH_URL` (`http://localhost:3000`), whatever port the app runs on.
