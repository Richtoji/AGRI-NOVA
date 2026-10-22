import { NextResponse } from "next/server";
import { getCropKnowledge } from "@/data/cropKnowledge";
import { prisma } from "@/lib/prisma";
import { KERALA_AGRO_CLIMATIC_ZONES, CROP_PROFILES, CROP_PROFILES_ARRAY } from "@/data/agroClimaticZones";
import { inMemoryStore } from "@/lib/data/inMemoryStore";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

function isCustomImage(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith('data:image')) return true;
  if (u.startsWith('/api/uploads') || u.startsWith('/uploads')) return true;
  if (u.startsWith('http://') || u.startsWith('https://')) return true;
  if (u.startsWith('/') && !u.startsWith('/images/crops/')) return true;
  return false;
}

function pickBestImage(primary?: string, secondary?: string): string {
  if (isCustomImage(primary)) return primary!;
  if (isCustomImage(secondary)) return secondary!;
  return primary || secondary || '';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("latitude") || searchParams.get("lat");
  const lngStr = searchParams.get("longitude") || searchParams.get("lon") || searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400, headers: NO_CACHE_HEADERS });
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

    let dbCropProfiles: any[] = [];
    try {
      dbCropProfiles = await (prisma as any).cropProfile.findMany({
        where: { name: { in: topCrops } }
      });
    } catch (e) {
      dbCropProfiles = [];
    }

    const recommendations = topCrops.map((cropName: string) => {
      // 1. Check inMemoryStore first (takes precedence for live admin updates/photos)
      const memProfile = inMemoryStore.getCropProfileByName(cropName);
      
      // 2. Check DB profile
      const dbProfile = dbCropProfiles.find(p => (p.name || '').toLowerCase() === cropName.toLowerCase());
      
      const knowledge = getCropKnowledge(cropName);

      const bestImg = pickBestImage(memProfile?.imageUrl, dbProfile?.imageUrl);
      const effectiveImageUrl = bestImg || `/images/crops/${cropName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      const effectiveYield = memProfile?.expectedYield || dbProfile?.expectedYield || knowledge.expectedYield;
      const effectivePeriod = memProfile?.growingPeriod || dbProfile?.growingPeriod || knowledge.growingPeriod;
      const effectiveWater = memProfile?.waterRequirement ?? dbProfile?.waterRequirement ?? knowledge.waterRequirement;
      const effectiveFertilizer = memProfile?.fertilizer || dbProfile?.fertilizer || knowledge.fertilizer;
      const effectivePesticide = memProfile?.pesticide || dbProfile?.pesticide || knowledge.pesticide;
      const effectiveId = memProfile?.id || dbProfile?.id || `profile_${cropName.toLowerCase().replace(/\s+/g, '_')}`;
      
      const isCashCrop = ["Rubber", "Cardamom", "Coffee", "Tea", "Black Pepper", "Cashew", "Arecanut"].includes(cropName);
      
      let metricLabel = isCashCrop ? "Expected Profit" : "Expected Yield";
      let metricValue = effectiveYield;
      let badgeLabel = isCashCrop ? "Maximum Profit" : "Maximum Yield";
      
      if (isCashCrop && !metricValue.includes("Lakh") && !metricValue.includes("₹")) {
        metricValue = `₹1.5 - 3.0 Lakh/ha`;
      }

      return {
        id: effectiveId,
        name: cropName,
        badgeLabel,
        metricLabel,
        metricValue,
        growingPeriod: effectivePeriod,
        waterRequirement: effectiveWater,
        fertilizer: effectiveFertilizer,
        pesticide: effectivePesticide,
        image: effectiveImageUrl,
        zoneName: zone.name,
        elevation: elevation
      };
    });

    return NextResponse.json({
      zone: zone.name,
      elevation: elevation,
      recommendations
    }, { headers: NO_CACHE_HEADERS });

  } catch (error) {
    console.error("Error generating crop recommendations:", error);
    const defaultZone = KERALA_AGRO_CLIMATIC_ZONES[0];
    const topCrops = defaultZone.majorCrops.slice(0, 2);
    const recs = topCrops.map(name => {
      const memProfile = inMemoryStore.getCropProfileByName(name);
      const k = getCropKnowledge(name);
      const fallbackBestImg = pickBestImage(memProfile?.imageUrl);
      return {
        id: memProfile?.id || `profile_${name.toLowerCase().replace(/\s+/g, '_')}`,
        name,
        badgeLabel: "Recommended Crop",
        metricLabel: "Expected Yield",
        metricValue: memProfile?.expectedYield || k.expectedYield,
        growingPeriod: memProfile?.growingPeriod || k.growingPeriod,
        waterRequirement: memProfile?.waterRequirement ?? k.waterRequirement,
        fertilizer: memProfile?.fertilizer || k.fertilizer,
        pesticide: memProfile?.pesticide || k.pesticide,
        image: fallbackBestImg || `/images/crops/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        zoneName: defaultZone.name,
        elevation: 15
      };
    });

    return NextResponse.json({
      zone: defaultZone.name,
      elevation: 15,
      recommendations: recs
    }, { headers: NO_CACHE_HEADERS });
  }
}

