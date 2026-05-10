> This project is made with the help of Claude (1M context).

# QuickApps

SaaS landing page and full-stack platform — a quick-launch app builder backed by NestJS + Prisma.

## Overview

QuickApps pairs a high-conversion marketing site with a full SaaS application: authentication, dashboards, pricing, and an add-ons marketplace. The Next.js frontend rewrites API calls to a NestJS backend that orchestrates database access, job queues, and integrations via the @buildwithdarsh/sdk.

## Frontend Features

- Landing page (Hero, Problem/Solution, How It Works, Features, Pricing, Testimonials)
- Authentication routes (`(auth)` group)
- Dashboard and user management (`(dashboard)` group)
- Agency & Add-ons sections
- Pricing and subscription module
- SEO (sitemap.ts, robots.ts) + custom security headers (X-Frame-Options, X-XSS-Protection)
- Image optimization (AVIF, WebP)
- API rewrites to backend NestJS server

## Backend Features

- NestJS REST API with 15+ feature modules
- Prisma ORM
- BullMQ job queue for async work
- Auth, billing, integrations

## Tech Stack

### Frontend
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Framer Motion, Lucide React
- @buildwithdarsh/sdk

### Backend (`/backend`)
- NestJS + Prisma + BullMQ

## Getting Started

```bash
# Frontend
npm install
cp .env.example .env.local
npm run dev

# Backend
cd backend
npm install
cp .env.example .env
npm run start:dev
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
