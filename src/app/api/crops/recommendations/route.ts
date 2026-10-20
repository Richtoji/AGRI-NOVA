import { NextResponse } from "next/server";
import { getCropKnowledge } from "@/data/cropKnowledge";
import { prisma } from "@/lib/prisma";

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

    let elevation = 10;
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.elevation && data.elevation.length > 0) {
          elevation = data.elevation[0];
        }
      }
    } catch (e) {
      console.error("Failed to fetch elevation, defaulting to 10m", e);
    }

    const allZones = await prisma.agroClimaticZone.findMany();

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

    if (matchedZones.length === 0) {
      return NextResponse.json({ error: "No zones found in DB" }, { status: 404 });
    }

    const zone = matchedZones[0];
    const topCrops = zone.majorCrops.slice(0, 2);

    const cropProfiles = await prisma.cropProfile.findMany({
      where: { name: { in: topCrops } }
    });

    const recommendations = topCrops.map(cropName => {
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
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
