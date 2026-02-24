import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/clerk-auth";

export async function POST(request: NextRequest) {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invitationId, token } = body;

    if (!invitationId && !token) {
      return NextResponse.json({ error: "Invitation ID or token required" }, { status: 400 });
    }

    const invitation = token
      ? await prisma.invitation.findUnique({ where: { token }, include: { sender: true } })
      : await prisma.invitation.findUnique({ where: { id: invitationId }, include: { sender: true } });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.email !== dbUser.email) {
      return NextResponse.json({ error: "This invitation is not for you" }, { status: 403 });
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
      prisma.contact.createMany({
        data: [
          { ownerId: invitation.senderId, contactId: dbUser.id },
          { ownerId: dbUser.id, contactId: invitation.senderId },
        ],
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({
      message: "Invitation accepted",
      contact: {
        id: invitation.sender.id,
        name: invitation.sender.name,
        email: invitation.sender.email,
        avatarUrl: invitation.sender.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
