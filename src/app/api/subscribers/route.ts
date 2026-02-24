import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeEmail } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email);

    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) {
      if (!existing.active) {
        await prisma.subscriber.update({
          where: { email },
          data: { active: true },
        });
        return NextResponse.json({ message: "Re-subscribed successfully" });
      }
      return NextResponse.json({ message: "Already subscribed" });
    }

    await prisma.subscriber.create({ data: { email } });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid email format") {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    console.error("Subscriber API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const subscriber = await prisma.subscriber.findUnique({ where: { token } });
    if (!subscriber) {
      return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 404 });
    }

    await prisma.subscriber.update({
      where: { token },
      data: { active: false },
    });

    return NextResponse.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
