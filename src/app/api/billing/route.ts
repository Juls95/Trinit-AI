import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

export async function GET() {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      isPaid: dbUser.isPaid,
      plan: dbUser.stripePlan || null,
      priceAmount: dbUser.stripePriceAmount || null,
      billingPeriodEnd: dbUser.billingPeriodEnd || null,
      hasSubscription: !!dbUser.stripeSubscriptionId,
      email: dbUser.email,
    });
  } catch (error) {
    console.error("Billing GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === "cancel" && dbUser.stripeSubscriptionId) {
      await stripe.subscriptions.update(dbUser.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return NextResponse.json({ message: "Subscription will cancel at end of billing period" });
    }

    return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
  } catch (error) {
    console.error("Billing DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
