const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); async function main() { const product = await prisma.product.findFirst(); console.log(product); } main();
