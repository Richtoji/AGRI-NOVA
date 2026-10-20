import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { email: true, avatarUrl: true }
  });
  console.log(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
