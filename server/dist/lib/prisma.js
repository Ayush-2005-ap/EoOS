"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Create a single shared Prisma Client instance
const prisma = new client_1.PrismaClient({
    log: ["warn", "error"],
});
exports.default = prisma;
