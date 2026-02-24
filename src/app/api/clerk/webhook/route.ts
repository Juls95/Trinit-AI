import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing svix headers");
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  const body = await request.text();

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const clerkId = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || email.split("@")[0] || "User";
    const avatarUrl = data.image_url || null;

    if (!email) {
      console.error("No email found for user:", clerkId);
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    try {
      const existingByClerkId = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (existingByClerkId) {
        await prisma.user.update({
          where: { clerkId },
          data: { email, name, avatarUrl },
        });
        console.log(`Updated user ${clerkId} (${email})`);
      } else {
        const existingByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingByEmail) {
          await prisma.user.update({
            where: { email },
            data: { clerkId, name, avatarUrl },
          });
          console.log(`Linked existing user ${email} to clerk ${clerkId}`);
        } else {
          await prisma.user.create({
            data: { clerkId, email, name, avatarUrl },
          });
          console.log(`Created new user ${clerkId} (${email})`);
        }
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error syncing user:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  if (type === "user.deleted") {
    const clerkId = data.id;
    try {
      await prisma.user.deleteMany({ where: { clerkId } });
      console.log(`Deleted user ${clerkId}`);
    } catch (dbError) {
      console.error("Database error deleting user:", dbError);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ received: true });
}
