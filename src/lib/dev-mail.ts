import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * The latest password-reset email, of any account: the dev mailbox shown on /email (it stands in for a real inbox).
 * Server only: the client never reads DevMail. Only the link and the date leave this function, not the address.
 */
export const getLatestPasswordResetMail = () =>
  prisma.devMail.findFirst({
    where: { kind: "PASSWORD_RESET" },
    orderBy: { createdAt: "desc" },
    select: { content: true, createdAt: true },
  });
