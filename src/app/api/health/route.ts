import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  checks.DATABASE_URL = process.env.DATABASE_URL ? "set (***" + process.env.DATABASE_URL.slice(-20) + ")" : "NOT SET";
  checks.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ? "set (" + process.env.CLERK_SECRET_KEY.slice(0, 8) + "...)" : "NOT SET";
  checks.CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET ? "set" : "NOT SET";
  checks.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "set (" + process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(0, 12) + "...)" : "NOT SET";

  try {
    const userCount = await prisma.user.count();
    checks.database = `connected (${userCount} users)`;
  } catch (err) {
    checks.database = `FAILED: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({ status: "ok", checks, timestamp: new Date().toISOString() });
}
