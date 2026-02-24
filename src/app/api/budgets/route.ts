import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

export async function GET() {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const budgets = await prisma.budget.findMany({
      where: { userId: dbUser.id, month: currentMonth },
      orderBy: { createdAt: "asc" },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: dbUser.id,
        type: "EXPENSE",
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
    });

    const sharedWithMe = await prisma.transactionShare.findMany({
      where: { userId: dbUser.id },
      include: { transaction: true },
    });

    const spentByCategory: Record<string, number> = {};
    for (const tx of transactions) {
      const hasShares = await prisma.transactionShare.count({ where: { transactionId: tx.id } });
      const effective = hasShares > 0 ? Math.abs(tx.amount) / 2 : Math.abs(tx.amount);
      spentByCategory[tx.category] = (spentByCategory[tx.category] || 0) + effective;
    }

    for (const share of sharedWithMe) {
      const tx = share.transaction;
      if (tx.type === "EXPENSE") {
        const effective = Math.abs(tx.amount) / 2;
        spentByCategory[tx.category] = (spentByCategory[tx.category] || 0) + effective;
      }
    }

    const budgetsWithSpent = budgets.map((b) => ({
      ...b,
      spent: Math.round((spentByCategory[b.name] || 0) * 100) / 100,
    }));

    return NextResponse.json({ budgets: budgetsWithSpent, month: currentMonth });
  } catch (error) {
    console.error("Budgets GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, budgeted, color, month } = body;

    if (!name || budgeted === undefined || !month) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_name_month: {
          userId: dbUser.id,
          name,
          month,
        },
      },
      update: {
        budgeted: parseFloat(budgeted),
        icon: icon || "💰",
        color: color || "bg-blue-500",
      },
      create: {
        userId: dbUser.id,
        name,
        icon: icon || "💰",
        budgeted: parseFloat(budgeted),
        color: color || "bg-blue-500",
        month,
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("Budgets POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, budgeted, name, icon, color } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing budget id" }, { status: 400 });
    }

    const existing = await prisma.budget.findFirst({
      where: { id, userId: dbUser.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (budgeted !== undefined) updateData.budgeted = parseFloat(budgeted);
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Budgets PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing budget id" }, { status: 400 });
    }

    const existing = await prisma.budget.findFirst({
      where: { id, userId: dbUser.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    await prisma.budget.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Budgets DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
