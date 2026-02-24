import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      const plan = session.metadata?.plan || "monthly";
      const customerId = session.customer as string;

      if (email) {
        const updateData: Record<string, unknown> = {
          isPaid: true,
          stripeCustomerId: customerId,
          stripePlan: plan,
        };

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as {
            id: string;
            current_period_end: number;
            items: { data: Array<{ price: { unit_amount: number | null } }> };
          };
          updateData.stripeSubscriptionId = subscription.id;
          updateData.billingPeriodEnd = new Date(subscription.current_period_end * 1000);
          if (subscription.items.data[0]?.price?.unit_amount) {
            updateData.stripePriceAmount = subscription.items.data[0].price.unit_amount;
          }
        } else if (plan === "lifetime") {
          updateData.stripePlan = "lifetime";
          updateData.stripePriceAmount = 19900;
          updateData.billingPeriodEnd = null;
        }

        await prisma.user.updateMany({
          where: { email },
          data: updateData,
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as unknown as {
        customer: string;
        current_period_end: number;
        status: string;
      };
      const customer = await stripe.customers.retrieve(subscription.customer) as Stripe.Customer;
      if (customer.email) {
        await prisma.user.updateMany({
          where: { email: customer.email },
          data: {
            billingPeriodEnd: new Date(subscription.current_period_end * 1000),
            isPaid: subscription.status === "active" || subscription.status === "trialing",
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
      if (customer.email) {
        await prisma.user.updateMany({
          where: { email: customer.email },
          data: {
            isPaid: false,
            stripeSubscriptionId: null,
            stripePlan: null,
            stripePriceAmount: null,
            billingPeriodEnd: null,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
