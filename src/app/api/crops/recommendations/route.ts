import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      if (!profile) {
        profile = {
          id: 'temp',
          name: cropName,
          expectedYield: "Varies",
          growingPeriod: "Varies",
          waterRequirement: 3,
          fertilizer: "Standard NPK",
          pesticide: "Standard",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      const isCashCrop = ["Rubber", "Cardamom", "Coffee", "Tea", "Black Pepper", "Cashew", "Arecanut"].includes(cropName);
      
      let metricLabel = isCashCrop ? "Expected Profit" : "Expected Yield";
      let metricValue = profile.expectedYield;
      let badgeLabel = isCashCrop ? "Maximum Profit" : "Maximum Yield";
      
      if (isCashCrop && !metricValue.includes("Lakh") && !metricValue.includes("₹")) {
          metricValue = `₹${(Math.random() * 2 + 1).toFixed(1)} - ${(Math.random() * 2 + 3).toFixed(1)} Lakh/ha`;
      }

      return {
        name: cropName,
        badgeLabel,
        metricLabel,
        metricValue,
        growingPeriod: profile.growingPeriod,
        waterRequirement: profile.waterRequirement,
        fertilizer: profile.fertilizer,
        pesticide: profile.pesticide,
        image: `/images/crops/${cropName.toLowerCase().replace(" ", "-")}.jpg`,
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
