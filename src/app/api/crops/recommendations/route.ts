import { NextResponse } from "next/server";
import { getCropKnowledge } from "@/data/cropKnowledge";
import { prisma } from "@/lib/prisma";
import { KERALA_AGRO_CLIMATIC_ZONES, CROP_PROFILES } from "@/data/agroClimaticZones";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("latitude");
  const lngStr = searchParams.get("longitude");

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 });
  }

  try {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    let elevation = 15;
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.elevation && data.elevation.length > 0) {
          elevation = data.elevation[0];
        }
      }
    } catch (e) {
      console.warn("Failed to fetch elevation, using 15m default", e);
    }

    let allZones: any[] = [];
    try {
      allZones = await prisma.agroClimaticZone.findMany();
    } catch (e) {
      allZones = KERALA_AGRO_CLIMATIC_ZONES;
    }

    if (!allZones || allZones.length === 0) {
      allZones = KERALA_AGRO_CLIMATIC_ZONES;
    }

    let matchedZones = allZones.filter(
      (zone) => elevation >= zone.minElevation && elevation <= zone.maxElevation
    );

    if (matchedZones.length === 0 && allZones.length > 0) {
      matchedZones = [...allZones].sort((a, b) => {
        const distA = Math.min(Math.abs(elevation - a.minElevation), Math.abs(elevation - a.maxElevation));
        const distB = Math.min(Math.abs(elevation - b.minElevation), Math.abs(elevation - b.maxElevation));
        return distA - distB;
      });
    }

    const zone = matchedZones[0] || KERALA_AGRO_CLIMATIC_ZONES[0];
    const topCrops = zone.majorCrops.slice(0, 2);

    let cropProfiles: any[] = [];
    try {
      cropProfiles = await prisma.cropProfile.findMany({
        where: { name: { in: topCrops } }
      });
    } catch (e) {
      cropProfiles = CROP_PROFILES.filter((p: any) => topCrops.includes(p.name));
    }

    const recommendations = topCrops.map((cropName: string) => {
      let profile = cropProfiles.find(p => p.name === cropName);
      const knowledge = getCropKnowledge(cropName);

      if (!profile) {
        profile = {
          id: `profile_${cropName.toLowerCase().replace(/\s+/g, '_')}`,
          name: cropName,
          category: knowledge.category,
          scientificName: knowledge.scientificName,
          description: knowledge.description,
          climateRequirements: knowledge.climateRequirements,
          soilRequirements: knowledge.soilRequirements,
          expectedYield: knowledge.expectedYield,
          growingPeriod: knowledge.growingPeriod,
          waterRequirement: knowledge.waterRequirement,
          fertilizer: knowledge.fertilizer,
          pesticide: knowledge.pesticide,
          imageUrl: `/images/crops/${cropName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any;
      }
      
      const isCashCrop = ["Rubber", "Cardamom", "Coffee", "Tea", "Black Pepper", "Cashew", "Arecanut"].includes(cropName);
      
      let metricLabel = isCashCrop ? "Expected Profit" : "Expected Yield";
      let metricValue = profile.expectedYield || knowledge.expectedYield;
      let badgeLabel = isCashCrop ? "Maximum Profit" : "Maximum Yield";
      
      if (isCashCrop && !metricValue.includes("Lakh") && !metricValue.includes("₹")) {
        metricValue = `₹1.5 - 3.0 Lakh/ha`;
      }

      return {
        id: profile.id,
        name: cropName,
        badgeLabel,
        metricLabel,
        metricValue,
        growingPeriod: profile.growingPeriod || knowledge.growingPeriod,
        waterRequirement: profile.waterRequirement || knowledge.waterRequirement,
        fertilizer: profile.fertilizer || knowledge.fertilizer,
        pesticide: profile.pesticide || knowledge.pesticide,
        image: profile.imageUrl || `/images/crops/${cropName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        zoneName: zone.name,
        elevation: elevation
      };
    });

    return NextResponse.json({
      zone: zone.name,
      elevation: elevation,
      recommendations
    });

  } catch (error) {
    console.error("Error generating crop recommendations:", error);
    // Even in total catch block, return KERALA_AGRO_CLIMATIC_ZONES default recommendations
    const defaultZone = KERALA_AGRO_CLIMATIC_ZONES[0];
    const topCrops = defaultZone.majorCrops.slice(0, 2);
    const recs = topCrops.map(name => {
      const k = getCropKnowledge(name);
      return {
        id: `profile_${name.toLowerCase().replace(/\s+/g, '_')}`,
        name,
        badgeLabel: "Recommended Crop",
        metricLabel: "Expected Yield",
        metricValue: k.expectedYield,
        growingPeriod: k.growingPeriod,
        waterRequirement: k.waterRequirement,
        fertilizer: k.fertilizer,
        pesticide: k.pesticide,
        image: `/images/crops/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        zoneName: defaultZone.name,
        elevation: 15
      };
    });

    return NextResponse.json({
      zone: defaultZone.name,
      elevation: 15,
      recommendations: recs
    });
  }
}
