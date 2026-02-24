# Trinit AI — Project Documentation

**Date**: February 24, 2026
**Stack**: Next.js 15 (App Router) · Prisma · Supabase · Clerk · Stripe · Resend · Framer Motion

---

## TL;DR

Trinit is an AI-powered personal finance web app. Users can track transactions, set budgets, share expenses with contacts, and manage subscriptions — all synced to Supabase with Clerk auth and Stripe billing.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js App Router + Framer Motion + Tailwind  │
├─────────────────────────────────────────────────┤
│                  API Routes                      │
│  /api/transactions · /api/budgets · /api/billing │
│  /api/contacts · /api/dashboard · /api/chat      │
│  /api/stripe/checkout · /api/stripe/verify       │
│  /api/stripe/webhook · /api/subscribers          │
├─────────────────────────────────────────────────┤
│              Services & Auth                     │
│  Clerk (Auth) · Stripe (Billing) · Resend (Email)│
├─────────────────────────────────────────────────┤
│              Database                            │
│  Supabase PostgreSQL via Prisma ORM             │
└─────────────────────────────────────────────────┘
```

## Features

### Core
- **Dashboard** — Net worth, income/expenses summary, recent transactions, budget overview
- **Transactions** — Add/edit/delete with categories; filter All/Mine/Shared
- **Budget** — User-defined categories with inline editing, add/delete, progress tracking
- **Reports** — Real data from transactions & budgets (Coming Soon: AI insights)
- **Contacts** — Invite via email (Resend), accept invitations, manage contact list

### Shared Transactions
- Share any transaction with contacts
- Shared transactions split 50/50 in both users' dashboards and totals
- Shared users see the transaction in their "Shared with me" view

### Billing (Stripe)
- **Free tier**: 5 transactions/day, no Chat AI or Reports AI
- **Monthly**: $8/mo
- **Annual**: $80/yr
- **Lifetime (Founding Member)**: $199 one-time
- Subscription management in Settings (view status, cancel)
- Webhook + fallback `/api/stripe/verify` for payment confirmation

### Auth (Clerk)
- Google & GitHub OAuth
- Clerk webhook syncs users to Supabase `users` table
- Middleware protects `/chat` route

### Coming Soon
- Chat AI — AI-powered financial assistant
- Recurring Transactions — Auto-tracking for bills & subscriptions

## Database Schema

See `prisma/schema.prisma` for full schema. Key models:
- `User` — Synced from Clerk, stores billing info
- `Transaction` — Income/expense with category, date, amount
- `TransactionShare` — Links shared transactions to contacts
- `Budget` — Per-user, per-month, per-category budget targets
- `Contact` — Bidirectional contact relationships
- `Invitation` — Email-based invitations with token acceptance
- `Subscriber` — Landing page newsletter signups

## Environment Variables

See `docs/env_template.md` for the full list of required variables.

## Deployment

1. Push to GitHub
2. Import in Vercel
3. Set all environment variables
4. Configure Clerk production URLs
5. Create Stripe production webhook → `/api/stripe/webhook`
6. Verify domain in Resend (optional, for custom sender)

Build command: `prisma generate && next build`
