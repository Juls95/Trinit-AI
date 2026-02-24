import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGrokAPI } from "@/lib/grok";
import { sanitizeInput } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

export async function POST(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(dbUser.id);
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait 1 minute." },
        { status: 429 }
      );
    }

    if (!dbUser.isPaid) {
      return NextResponse.json({
        error: "PAID_ONLY",
        message: "Trinit AI Chat is available for paid members. Upgrade to unlock AI-powered financial insights.",
      }, { status: 403 });
    }

    const body = await request.json();
    const rawMessage = body.message;

    if (!rawMessage || typeof rawMessage !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const message = sanitizeInput(rawMessage);

    const userChat = await prisma.chat.create({
      data: {
        sender: "USER",
        userId: dbUser.id,
        message,
      },
    });

    const recentChats = await prisma.chat.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const conversationHistory = recentChats.reverse().map((c: { sender: string; message: string }) => ({
      role: c.sender === "USER" ? "user" : "assistant",
      content: c.message,
    }));

    const grokResponse = await callGrokAPI(message, conversationHistory);

    const aiChat = await prisma.chat.create({
      data: {
        sender: "AI",
        userId: dbUser.id,
        message: grokResponse.reply,
      },
    });

    if (grokResponse.classification?.type && grokResponse.classification?.amount) {
      await prisma.record.create({
        data: {
          authorId: dbUser.id,
          messageId: userChat.id,
          classification: grokResponse.classification.type,
          amount: grokResponse.classification.amount,
        },
      });
    }

    return NextResponse.json({
      reply: grokResponse.reply,
      classification: grokResponse.classification,
      chatId: aiChat.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
