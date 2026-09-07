import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mockSeedData } from "./seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with mock users...");

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const user of mockSeedData.users) {
    const existing = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          kycStatus: user.kycStatus as any,
          passwordHash: passwordHash
        }
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log("Database seeded with users successfully!");

  console.log("Seeding database with mock products...");
  for (const product of mockSeedData.products) {
    const existingProduct = await prisma.product.findUnique({
      where: { id: product.id }
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          id: product.id,
          // If sellerId doesn't exist, we will use a default or the first user's ID
          sellerId: product.sellerId || mockSeedData.users[0].id,
          title: product.title,
          description: product.description || "Fresh local produce",
          category: product.category,
          price: product.price,
          unit: product.unit || "Kg",
          stockQuantity: (product as any).stock || 100,
          imageUrl: product.imageUrl,
          rating: product.rating || 5.0
        }
      });
      console.log(`Created product: ${product.title}`);
    } else {
      console.log(`Product already exists: ${product.title}`);
    }
  }
  console.log("Database seeded with products successfully!");

  console.log("Seeding database with mock equipment...");
  for (const eq of mockSeedData.equipment) {
    const existingEq = await prisma.equipment.findUnique({
      where: { id: eq.id }
    });

    if (!existingEq) {
      await prisma.equipment.create({
        data: {
          id: eq.id,
          ownerId: eq.ownerId || mockSeedData.users.find(u => u.role === 'EQUIPMENT_OWNER')?.id || mockSeedData.users[0].id,
          name: eq.name,
          category: eq.category,
          dailyRate: eq.dailyRate,
          hourlyRate: eq.hourlyRate,
          imageUrl: eq.imageUrl,
          locationName: eq.locationName,
          available: eq.available
        }
      });
      console.log(`Created equipment: ${eq.name}`);
    } else {
      console.log(`Equipment already exists: ${eq.name}`);
    }
  }
  console.log("Database seeded with equipment successfully!");
}

main()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
