const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const crops = await prisma.cropProfile.findMany({
    where: {
      imageUrl: {
        startsWith: '/uploads/'
      }
    }
  });

  for (const crop of crops) {
    await prisma.cropProfile.update({
      where: { id: crop.id },
      data: { imageUrl: crop.imageUrl.replace('/uploads/', '/api/uploads/') }
    });
  }

  const products = await prisma.product.findMany({
    where: {
      imageUrl: {
        startsWith: '/uploads/'
      }
    }
  });

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: product.imageUrl.replace('/uploads/', '/api/uploads/') }
    });
  }

  console.log('Updated db records');
}

main().catch(console.error).finally(() => prisma.$disconnect());
