# Environment Variables

Copy this to `.env.local` and fill in your values.

```env
# ── Supabase ──────────────────────────────────
DATABASE_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# ── Clerk ─────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# ── Stripe ────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ── Resend ────────────────────────────────────
RESEND_API_KEY="re_..."

# ── AI (Grok) ─────────────────────────────────
GROK_API_KEY="xai-..."

# ── App ───────────────────────────────────────
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## Notes

- **DATABASE_URL** uses port `6543` (PgBouncer pooling) — required for serverless
- **DIRECT_URL** uses port `5432` (direct) — used by Prisma migrations
- **CLERK_WEBHOOK_SECRET** — From Clerk Dashboard → Webhooks → your endpoint
- **STRIPE_WEBHOOK_SECRET** — From Stripe Dashboard → Developers → Webhooks
- **NEXT_PUBLIC_APP_URL** — Must match your production domain for email links
