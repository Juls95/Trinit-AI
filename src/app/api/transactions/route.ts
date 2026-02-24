import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

export async function GET() {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [ownTransactions, sharedWithMe] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: dbUser.id },
        include: {
          sharedWith: {
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          },
        },
        orderBy: { date: "desc" },
        take: 100,
      }),
      prisma.transaction.findMany({
        where: { sharedWith: { some: { userId: dbUser.id } } },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          sharedWith: {
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
          },
        },
        orderBy: { date: "desc" },
        take: 100,
      }),
    ]);

    const transactions = ownTransactions.map((t) => ({
      ...t,
      isSharedWithMe: false,
      sharedWith: t.sharedWith.map((s) => s.user),
    }));

    const shared = sharedWithMe.map((t) => ({
      ...t,
      isSharedWithMe: true,
      owner: t.user,
      sharedWith: t.sharedWith.map((s) => s.user),
    }));

    return NextResponse.json({ transactions, shared });
  } catch (error) {
    console.error("Transactions GET error:", error);
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
    const { description, amount, type, category, date, sharedWithIds } = body;

    if (!description || amount === undefined || !type || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    if (!dbUser.isPaid) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayCount = await prisma.transaction.count({
        where: { userId: dbUser.id, createdAt: { gte: startOfDay } },
      });
      if (todayCount >= 5) {
        return NextResponse.json({
          error: "FREE_LIMIT",
          message: "Free accounts are limited to 5 transactions per day. Upgrade to Trinit Pro for unlimited transactions.",
        }, { status: 403 });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        description,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date) : new Date(),
        ...(Array.isArray(sharedWithIds) && sharedWithIds.length > 0
          ? {
              sharedWith: {
                create: sharedWithIds.map((uid: string) => ({ userId: uid })),
              },
            }
          : {}),
      },
      include: {
        sharedWith: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json({
      transaction: {
        ...transaction,
        sharedWith: transaction.sharedWith.map((s) => s.user),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Transactions POST error:", error);
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
    const { id, sharedWithIds } = body;

    if (!id) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: dbUser.id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transactionShare.deleteMany({
      where: { transactionId: id },
    });

    if (Array.isArray(sharedWithIds) && sharedWithIds.length > 0) {
      await prisma.transactionShare.createMany({
        data: sharedWithIds.map((uid: string) => ({ transactionId: id, userId: uid })),
        skipDuplicates: true,
      });
    }

    const updated = await prisma.transaction.findUnique({
      where: { id },
      include: {
        sharedWith: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json({
      transaction: {
        ...updated,
        sharedWith: updated?.sharedWith.map((s) => s.user) || [],
      },
    });
  } catch (error) {
    console.error("Transactions PATCH error:", error);
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
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: dbUser.id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Transactions DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
