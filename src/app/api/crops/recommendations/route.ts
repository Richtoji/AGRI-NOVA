import { NextResponse } from "next/server";
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

    // 1. Fetch Elevation from Open-Meteo
    let elevation = 10; // default to coastal plain if API fails
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

    // 2. Match Agro-Climatic Zone based on elevation
    // We filter zones where elevation falls within min/max.
    // If multiple match, we take the first one (can be improved with name matching later)
    let matchedZones = KERALA_AGRO_CLIMATIC_ZONES.filter(
      (zone) => elevation >= zone.minElevation && elevation <= zone.maxElevation
    );

    // If no exact match (e.g. negative elevation but not Kuttanad), just find closest
    if (matchedZones.length === 0) {
      matchedZones = [...KERALA_AGRO_CLIMATIC_ZONES].sort((a, b) => {
        const distA = Math.min(Math.abs(elevation - a.minElevation), Math.abs(elevation - a.maxElevation));
        const distB = Math.min(Math.abs(elevation - b.minElevation), Math.abs(elevation - b.maxElevation));
        return distA - distB;
      });
    }

    const zone = matchedZones[0];

    // 3. Extract top 2 crops and their profiles
    const topCrops = zone.majorCrops.slice(0, 2);
    const recommendations = topCrops.map(cropName => {
      const profile = CROP_PROFILES[cropName] || CROP_PROFILES["Vegetables"];
      
      // Determine the metric to display based on the crop type
      // Cash crops usually show Maximum Profit, food crops show Maximum Yield
      const isCashCrop = ["Rubber", "Cardamom", "Coffee", "Tea", "Black Pepper", "Cashew", "Arecanut"].includes(cropName);
      
      let metricLabel = isCashCrop ? "Expected Profit" : "Expected Yield";
      let metricValue = profile.expectedYield; // We reuse expectedYield field for both in mock profile
      let badgeLabel = isCashCrop ? "Maximum Profit" : "Maximum Yield";
      
      if (isCashCrop && !metricValue.includes("Lakh") && !metricValue.includes("₹")) {
          // Add some mock financial value if not present
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
        image: `/images/crops/${cropName.toLowerCase().replace(" ", "-")}.jpg`, // placeholder path
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
