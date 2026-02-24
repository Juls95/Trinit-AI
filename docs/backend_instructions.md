# Backend Instructions — Trinit AI

## Overview

Trinit is a full-stack personal finance application built with:
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Authentication**: Clerk (Google & GitHub OAuth)
- **Payments**: Stripe (Monthly $8, Annual $80, Lifetime $199)
- **Email**: Resend (contact invitations)
- **AI**: Grok API (Coming Soon — Chat AI feature)

## API Routes

| Route | Methods | Description |
|---|---|---|
| `/api/dashboard` | GET | Dashboard summary (net worth, income, expenses, budgets) |
| `/api/transactions` | GET, POST, PATCH, DELETE | CRUD for transactions + sharing |
| `/api/budgets` | GET, POST, PATCH, DELETE | CRUD for budget categories |
| `/api/contacts` | GET, POST, DELETE | Contact management + invitations |
| `/api/contacts/accept` | POST | Accept invitation via token |
| `/api/billing` | GET, DELETE | Subscription status & cancellation |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/verify` | POST | Verify payment via session_id |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/chat` | POST | AI chat (premium only) |
| `/api/subscribers` | POST | Newsletter signup |

## Free Tier Limits

- **5 transactions per day** (server-enforced in `/api/transactions` POST)
- **Chat AI**: Paid members only
- **Reports AI insights**: Paid members only

## Shared Transactions Logic

- Any transaction can be shared with 1+ contacts
- Shared transactions are split 50/50 for dashboard calculations
- Both owner and shared contacts see the transaction
- TransactionShare model links transactions to shared users

## Clerk → Supabase Sync

Users are synced via Clerk webhook (`user.created` event):
- Clerk fires webhook → `/api/auth/callback` (or Clerk Dashboard webhook)
- Creates/updates user in Supabase `users` table
- Stores `clerkId`, `email`, `name`

## Stripe Payment Flow

1. User clicks pricing plan → `/api/stripe/checkout` creates session
2. Stripe redirects to `/chat?session_id=xxx` on success
3. Client calls `/api/stripe/verify` with session_id
4. Server verifies with Stripe API and updates user billing fields
5. Webhook also handles `checkout.session.completed` as backup

## Prisma Commands

```bash
npx prisma generate    # Generate client
npx prisma db push     # Push schema to database
npx prisma studio      # Open database GUI
```
