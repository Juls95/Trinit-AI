import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (dbUser) return dbUser;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const name = clerkUser.fullName || clerkUser.firstName || email.split("@")[0] || "User";
  const avatarUrl = clerkUser.imageUrl;

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    dbUser = await prisma.user.update({
      where: { email },
      data: { clerkId: userId, name, avatarUrl },
    });
  } else {
    dbUser = await prisma.user.create({
      data: { clerkId: userId, email, name, avatarUrl },
    });
  }

  return dbUser;
}
