// import { PrismaClient } from "@/generated/prisma";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ["query"],
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export default prisma;

// lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Ensure Prisma uses DATABASE_URL at runtime
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        // Sanitize DATABASE_URL to avoid accidental surrounding quotes/whitespace
        url:
          typeof process.env.DATABASE_URL === "string"
            ? process.env.DATABASE_URL.trim().replace(/^"|"$/g, "")
            : process.env.DATABASE_URL,
      },
    },
    log: ["query"], // useful for debugging
  });

// For hot-reloading in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
