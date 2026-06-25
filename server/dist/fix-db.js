"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const states = await prisma.state.findMany();
    console.log(`Found ${states.length} states.`);
    for (const s of states) {
        if (s.pdfUrl) {
            console.log(`State ${s.name} PDF URL: ${s.pdfUrl}`);
            if (s.pdfUrl.includes('ras.cloudinary.com')) {
                await prisma.state.update({
                    where: { id: s.id },
                    data: { pdfUrl: s.pdfUrl.replace('ras.cloudinary.com', 'res.cloudinary.com') }
                });
                console.log(`-> Fixed state PDF: ${s.name}`);
            }
        }
        else {
            console.log(`State ${s.name} has no PDF URL.`);
        }
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
