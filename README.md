# Becoming

**Becoming** is a personal sandbox project focused on self-improvement, habit tracking and long-term progress.

The goal is to centralize personal data, visualize progress and experiment with integrations and AI-assisted analysis.

## Stack

- **Better Auth** — GitHub OAuth + email whitelist
- **Next.js** — Frontend & Backend
- **TypeScript**
- **PostgreSQL** + **Prisma**
- **Neon** — Hosted PostgreSQL
- **Tailwind CSS** + **shadcn/ui** — UI
- **Lucide** — Icons
- **Motion** — Animations
- **next-themes** — Theme management
- **Chart.js** + **react-chartjs-2** — Data visualization
- **Zod** — Validation
- **Vitest** + **Playwright** — Testing
- **ESLint** + **Prettier** — Code quality
- **GitHub Actions** — CI
- **Vercel** — Hosting

> **Becoming** — becoming a better version of yourself, without becoming someone else.

## Local setup (foundation)

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Update `.env`:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
- `BETTER_AUTH_URL` — `http://localhost:3000` locally
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth App (callback `http://localhost:3000/api/auth/callback/github`)
- `ALLOWED_EMAILS` — comma-separated whitelist of emails allowed to sign in

4. Apply migrations:

```bash
npx prisma migrate deploy
```

## Auth

- Better Auth + GitHub OAuth only
- Access gated by `ALLOWED_EMAILS` (checked on user creation and on each protected page)

## Cut (poids)

- Objectif : départ / cible / rythme (−kg/semaine)
- Journal de pesées + courbe 30 jours (poids, moyenne 7j, ligne cible)
- Habitudes en leviers sous le tracking poids

## Available scripts

```bash
npm run dev
npm run lint
npm run format
npm run format:check
npm run typecheck
npm test
npm run test:e2e
npm run build
```
