import { PrismaClient } from "@prisma/client";

// Create a single shared Prisma Client instance
const prisma = new PrismaClient({
  log: ["warn", "error"],
});

export default prisma;
