import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/clerk-auth";
import { sendInvitationEmail } from "@/lib/email";

export async function GET() {
  try {
    const dbUser = await getAuthenticatedUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [contacts, pendingInvitations] = await Promise.all([
      prisma.contact.findMany({
        where: { ownerId: dbUser.id },
        include: {
          contact: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invitation.findMany({
        where: { senderId: dbUser.id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const receivedInvitations = await prisma.invitation.findMany({
      where: { email: dbUser.email, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      contacts: contacts.map((c) => ({
        id: c.id,
        nickname: c.nickname,
        user: c.contact,
      })),
      pendingInvitations: pendingInvitations.map((i) => ({
        id: i.id,
        email: i.email,
        status: i.status,
        createdAt: i.createdAt,
      })),
      receivedInvitations: receivedInvitations.map((i) => ({
        id: i.id,
        token: i.token,
        sender: i.sender,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("Contacts GET error:", error);
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
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === dbUser.email) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });
    }

    const existingContact = await prisma.contact.findFirst({
      where: {
        ownerId: dbUser.id,
        contact: { email: normalizedEmail },
      },
    });

    if (existingContact) {
      return NextResponse.json({ error: "Already in your contacts" }, { status: 400 });
    }

    const existingInvitation = await prisma.invitation.findUnique({
      where: {
        senderId_email: {
          senderId: dbUser.id,
          email: normalizedEmail,
        },
      },
    });

    if (existingInvitation && existingInvitation.status === "PENDING") {
      return NextResponse.json({ error: "Invitation already sent" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (targetUser) {
      await prisma.contact.createMany({
        data: [
          { ownerId: dbUser.id, contactId: targetUser.id },
          { ownerId: targetUser.id, contactId: dbUser.id },
        ],
        skipDuplicates: true,
      });

      await prisma.invitation.upsert({
        where: {
          senderId_email: { senderId: dbUser.id, email: normalizedEmail },
        },
        update: { status: "ACCEPTED" },
        create: {
          senderId: dbUser.id,
          email: normalizedEmail,
          status: "ACCEPTED",
        },
      });

      return NextResponse.json({
        message: "Contact added",
        contact: { id: targetUser.id, name: targetUser.name, email: targetUser.email, avatarUrl: targetUser.avatarUrl },
        autoAccepted: true,
      }, { status: 201 });
    }

    const invitation = await prisma.invitation.upsert({
      where: {
        senderId_email: { senderId: dbUser.id, email: normalizedEmail },
      },
      update: { status: "PENDING" },
      create: {
        senderId: dbUser.id,
        email: normalizedEmail,
      },
    });

    try {
      await sendInvitationEmail({
        to: normalizedEmail,
        senderName: dbUser.name,
        token: invitation.token,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
    }

    return NextResponse.json({
      message: "Invitation sent! An email has been sent to " + normalizedEmail,
      invitation: { id: invitation.id, email: invitation.email, status: invitation.status },
    }, { status: 201 });
  } catch (error) {
    console.error("Contacts POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
