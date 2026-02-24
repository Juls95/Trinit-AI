import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

export async function GET() {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalIncome, totalExpenses, recurringCount, records, recentChats, transactions, sharedWithMe, budgets] = await Promise.all([
      prisma.record.aggregate({
        where: { authorId: dbUser.id, classification: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.record.aggregate({
        where: { authorId: dbUser.id, classification: "EXPENSE" },
        _sum: { amount: true },
      }),
      prisma.record.count({
        where: { authorId: dbUser.id, classification: "RECURRING" },
      }),
      prisma.record.findMany({
        where: { authorId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { message: true },
      }),
      prisma.chat.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.transaction.findMany({
        where: { userId: dbUser.id },
        include: { _count: { select: { sharedWith: true } } },
        orderBy: { date: "desc" },
        take: 50,
      }),
      prisma.transaction.findMany({
        where: { sharedWith: { some: { userId: dbUser.id } } },
        orderBy: { date: "desc" },
        take: 50,
      }),
      prisma.budget.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const income = totalIncome._sum.amount || 0;
    const expenses = totalExpenses._sum.amount || 0;

    const txIncome = transactions
      .filter((t: { type: string }) => t.type === "INCOME")
      .reduce((s: number, t: { amount: number; _count: { sharedWith: number } }) => {
        const share = t._count.sharedWith > 0 ? 0.5 : 1;
        return s + t.amount * share;
      }, 0);
    const txExpenses = transactions
      .filter((t: { type: string }) => t.type === "EXPENSE")
      .reduce((s: number, t: { amount: number; _count: { sharedWith: number } }) => {
        const share = t._count.sharedWith > 0 ? 0.5 : 1;
        return s + Math.abs(t.amount) * share;
      }, 0);

    const sharedIncome = sharedWithMe
      .filter((t: { type: string }) => t.type === "INCOME")
      .reduce((s: number, t: { amount: number }) => s + t.amount * 0.5, 0);
    const sharedExpenses = sharedWithMe
      .filter((t: { type: string }) => t.type === "EXPENSE")
      .reduce((s: number, t: { amount: number }) => s + Math.abs(t.amount) * 0.5, 0);

    return NextResponse.json({
      netWorth: (income + txIncome + sharedIncome) - (expenses + txExpenses + sharedExpenses),
      totalIncome: income + txIncome + sharedIncome,
      totalExpenses: expenses + txExpenses + sharedExpenses,
      recurringCount,
      isPaid: dbUser.isPaid,
      records: records.map((r: { id: string; classification: string; amount: number; message: { message: string }; createdAt: Date }) => ({
        id: r.id,
        classification: r.classification,
        amount: r.amount,
        message: r.message.message,
        createdAt: r.createdAt,
      })),
      recentChats: recentChats.map((c: { id: string; sender: string; message: string; createdAt: Date }) => ({
        id: c.id,
        sender: c.sender,
        message: c.message,
        createdAt: c.createdAt,
      })),
      transactions: transactions.map((t: { id: string; description: string; amount: number; type: string; category: string; date: Date }) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      })),
      budgets: budgets.map((b: { id: string; name: string; icon: string; budgeted: number; spent: number; color: string; month: string }) => ({
        id: b.id,
        name: b.name,
        icon: b.icon,
        budgeted: b.budgeted,
        spent: b.spent,
        color: b.color,
        month: b.month,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
