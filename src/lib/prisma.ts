import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client for the process (singleton).
 */
export const prisma = new PrismaClient();
