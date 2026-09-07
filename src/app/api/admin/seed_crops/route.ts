import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { KERALA_AGRO_CLIMATIC_ZONES, CROP_PROFILES } from "@/data/agroClimaticZones";

const prisma = new PrismaClient();

export async function GET() {
  try {
    let zonesCount = 0;
    let profilesCount = 0;

    // Seed AgroClimaticZones
    for (const zone of KERALA_AGRO_CLIMATIC_ZONES) {
      const existingZone = await prisma.agroClimaticZone.findUnique({
        where: { name: zone.name }
      });

      if (!existingZone) {
        await prisma.agroClimaticZone.create({
          data: {
            name: zone.name,
            minElevation: zone.minElevation,
            maxElevation: zone.maxElevation,
            landform: zone.landform,
            majorCrops: zone.majorCrops,
          }
        });
        zonesCount++;
      }
    }

    // Seed CropProfiles
    for (const [name, profile] of Object.entries(CROP_PROFILES)) {
      const existingProfile = await prisma.cropProfile.findUnique({
        where: { name }
      });

      if (!existingProfile) {
        await prisma.cropProfile.create({
          data: {
            name: name,
            expectedYield: profile.expectedYield,
            growingPeriod: profile.growingPeriod,
            waterRequirement: profile.waterRequirement,
            fertilizer: profile.fertilizer,
            pesticide: profile.pesticide,
          }
        });
        profilesCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${zonesCount} zones and ${profilesCount} crop profiles.`
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
