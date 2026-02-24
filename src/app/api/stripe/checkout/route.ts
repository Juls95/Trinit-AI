import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

const PRICE_MAP: Record<string, { priceId: string; mode: "subscription" | "payment" }> = {
  monthly: { priceId: process.env.STRIPE_PRICE_MONTHLY!, mode: "subscription" },
  annual: { priceId: process.env.STRIPE_PRICE_ANNUAL!, mode: "subscription" },
  lifetime: { priceId: process.env.STRIPE_PRICE_LIFETIME!, mode: "payment" },
};

export async function POST(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan || "monthly";
    const config = PRICE_MAP[plan];

    if (!config || !config.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const sessionParams: Record<string, unknown> = {
      payment_method_types: ["card"],
      customer_email: dbUser.email,
      line_items: [{ price: config.priceId, quantity: 1 }],
      mode: config.mode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?payment=cancelled`,
      metadata: { userId: dbUser.id, plan },
    };

    if (config.mode === "subscription") {
      sessionParams.subscription_data = { metadata: { userId: dbUser.id, plan } };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await stripe.checkout.sessions.create(sessionParams as any);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
