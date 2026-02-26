import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();
async function main() {
    const account = await prisma.verificationToken.findFirst({ orderBy: { createdAt: 'desc' } });
    fs.writeFileSync('token.json', JSON.stringify({ token: account?.token }));
    console.log("Token written to json");
}
main().finally(() => prisma.$disconnect());
