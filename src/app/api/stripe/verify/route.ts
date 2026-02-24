import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

export async function POST(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    if (session.customer_email !== dbUser.email) {
      return NextResponse.json({ error: "Session does not match user" }, { status: 403 });
    }

    const plan = session.metadata?.plan || "monthly";
    const customerId = session.customer as string;

    const updateData: Record<string, unknown> = {
      isPaid: true,
      stripeCustomerId: customerId,
      stripePlan: plan,
    };

    if (session.mode === "subscription" && session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as {
        id: string;
        current_period_end: number;
        items: { data: Array<{ price: { unit_amount: number | null } }> };
      };
      updateData.stripeSubscriptionId = sub.id;
      updateData.billingPeriodEnd = new Date(sub.current_period_end * 1000);
      if (sub.items.data[0]?.price?.unit_amount) {
        updateData.stripePriceAmount = sub.items.data[0].price.unit_amount;
      }
    } else if (plan === "lifetime") {
      updateData.stripePriceAmount = 19900;
      updateData.billingPeriodEnd = null;
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Payment verified",
      plan,
      isPaid: true,
    });
  } catch (error) {
    console.error("Stripe verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
