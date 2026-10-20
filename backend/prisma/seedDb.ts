import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { rawSeedData } from "./seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with authentic user profiles...");

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const user of rawSeedData.users) {
    try {
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
    } catch (e) {
      console.log(`Skipping user ${user.email} due to conflict.`);
    }
  }

  console.log("Database seeded with users successfully!");

  console.log("Seeding database with authentic agricultural produce...");
  for (const product of rawSeedData.products) {
    try {
      const existingProduct = await prisma.product.findUnique({
        where: { id: product.id }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            id: product.id,
            sellerId: product.sellerId || rawSeedData.users[0].id,
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
    } catch (e) {
      console.log(`Skipping product ${product.title} due to conflict.`);
    }
  }
  console.log("Database seeded with products successfully!");

  console.log("Seeding database with certified farm machinery fleet...");
  for (const eq of rawSeedData.equipment) {
    try {
      const existingEq = await prisma.equipment.findUnique({
        where: { id: eq.id }
      });

      if (!existingEq) {
        await prisma.equipment.create({
          data: {
            id: eq.id,
            ownerId: eq.ownerId || rawSeedData.users.find(u => u.role === 'EQUIPMENT_OWNER')?.id || rawSeedData.users[0].id,
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
    } catch (e) {
      console.log(`Skipping equipment ${eq.name} due to conflict.`);
    }
  }
  console.log("Database seeded with equipment successfully!");

  console.log("Seeding database with verified government agricultural schemes...");
  for (const scheme of rawSeedData.schemes) {
    try {
      const existingScheme = await prisma.governmentScheme.findUnique({
        where: { id: scheme.id }
      });

      if (!existingScheme) {
        await prisma.governmentScheme.create({
          data: {
            id: scheme.id,
            title: scheme.title,
            department: scheme.department,
            category: scheme.category,
            description: scheme.description,
            subsidyAmount: scheme.subsidyAmount,
            linkUrl: scheme.linkUrl,
            isActive: true
          }
        });
        console.log(`Created scheme: ${scheme.title}`);
      } else {
        console.log(`Scheme already exists: ${scheme.title}`);
      }
    } catch (e) {
      console.log(`Skipping scheme ${scheme.title} due to conflict.`);
    }
  }
  console.log("Database seeded with schemes successfully!");

  console.log("Seeding database with authentic regional livestock analysis...");
  const keralaDistricts = [
    { district: "Thiruvananthapuram", primaryLivestock: "Cows, Goats, Poultry (Broiler & Layer), Pigs, Rabbits", focusAreas: "Extensive dairy cooperatives, Malabari goat breeding, and rabbit farming." },
    { district: "Kollam", primaryLivestock: "Cows, Goats, Poultry, Buffaloes, Ducks", focusAreas: "Dairy farming, backyard goat rearing, and coastal wetland duck farming." },
    { district: "Pathanamthitta", primaryLivestock: "Cows, Buffaloes, Goats, Ducks, Pigs", focusAreas: "Dairy farming and Upper Kuttanad wetland duck farming." },
    { district: "Alappuzha", primaryLivestock: "Ducks, Cows, Buffaloes, Goats, Poultry", focusAreas: "State leader in duck farming (Kuttanad belt) and wetland cattle grazing." },
    { district: "Kottayam", primaryLivestock: "Cows, Buffaloes, Ducks, Pigs, Goats, Poultry", focusAreas: "Origin of the dwarf Vechur cow; extensive duck and pig rearing." },
    { district: "Idukki", primaryLivestock: "Cows, Pigs, Goats, Buffaloes, Poultry", focusAreas: "High-altitude dairy cattle, large-scale commercial piggery, and goat farming." },
    { district: "Ernakulam", primaryLivestock: "Cows, Poultry, Goats, Pigs, Buffaloes, Ducks", focusAreas: "Large-scale commercial poultry hubs, peri-urban dairies, and piggeries." },
    { district: "Thrissur", primaryLivestock: "Cows, Buffaloes, Goats, Pigs, Poultry, Ducks", focusAreas: "Major dairy cluster, significant buffalo numbers, and commercial pig breeding hubs." },
    { district: "Palakkad", primaryLivestock: "Cows, Buffaloes, Goats, Sheep, Poultry", focusAreas: "State leader in cattle and buffalo populations; home to the native Attappady Black goat." },
    { district: "Malappuram", primaryLivestock: "Cows, Goats, Buffaloes, Poultry, Ducks", focusAreas: "High poultry and Malabari goat population, supported by crossbred dairy farming." },
    { district: "Kozhikode", primaryLivestock: "Cows, Goats, Poultry, Pigs, Rabbits", focusAreas: "Commercial poultry breeding, Malabari goats, and local dairy units." },
    { district: "Wayanad", primaryLivestock: "Cows, Pigs, Goats, Buffaloes, Poultry", focusAreas: "Hill-tract dairy operations, prominent pig farming units, and free-range goat rearing." },
    { district: "Kannur", primaryLivestock: "Cows, Goats, Pigs, Poultry, Buffaloes", focusAreas: "Center for Malabari goat conservation, commercial poultry, and piggeries." },
    { district: "Kasaragod", primaryLivestock: "Cows, Goats, Buffaloes, Poultry", focusAreas: "Dairy farming, Kasaragod Dwarf cattle rearing, and backyard goat production." }
  ];

  for (const region of keralaDistricts) {
    try {
      await prisma.regionalLivestockAnalysis.upsert({
        where: { district: region.district },
        update: { primaryLivestock: region.primaryLivestock, focusAreas: region.focusAreas },
        create: region
      });
    } catch (e) {
      // Continue if exists
    }
  }
  console.log("Database seeded with regional livestock analysis successfully!");

  console.log("Seeding database with certified livestock breed recommendations...");
  const livestockBreeds = [
    {
      breedName: "Vechur Cow (Indigenous Dwarf)",
      expectedYield: "3 - 4 L/day (High Medicinal A2 Milk)",
      fatContent: "4.7% - 5.8%",
      maintenanceLevel: "Extremely Low (High Heat & Disease Resistance)",
      location: "Kottayam & Central Kerala",
      imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=500"
    },
    {
      breedName: "Malabari Goat (Tellicherry)",
      expectedYield: "1.5 - 2.5 L/day (Prolific Twinning)",
      fatContent: "3.8% - 4.5%",
      maintenanceLevel: "Low to Moderate",
      location: "Kozhikode, Kannur & Malabar Belt",
      imageUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500"
    },
    {
      breedName: "Kasaragod Dwarf Cattle",
      expectedYield: "2 - 3 L/day (Zero Grazing Tolerant)",
      fatContent: "4.5% - 5.2%",
      maintenanceLevel: "Very Low",
      location: "Kasaragod & North Kerala",
      imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500"
    },
    {
      breedName: "Murrah Buffalo",
      expectedYield: "10 - 16 L/day (High Milk Solids)",
      fatContent: "6.5% - 7.5%",
      maintenanceLevel: "Moderate to High",
      location: "Palakkad & Thrissur Plain",
      imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500"
    }
  ];

  for (const b of livestockBreeds) {
    try {
      const existing = await prisma.livestockRecommendation.findFirst({
        where: { breedName: b.breedName }
      });
      if (!existing) {
        await prisma.livestockRecommendation.create({ data: b });
      }
    } catch (e) {
      // Continue
    }
  }
  console.log("Database seeded with livestock breed recommendations successfully!");
}

main()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
