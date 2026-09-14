# Becoming

**Becoming** is a personal sandbox project focused on self-improvement, habit tracking and long-term progress.

The goal is to centralize personal data, visualize progress and experiment with integrations and AI-assisted analysis.

## Stack

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

3. Update `DATABASE_URL` in `.env` with your Neon PostgreSQL connection string.

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
