import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCropKnowledge } from '@/data/cropKnowledge';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cropProfileId = searchParams.get('cropProfileId');
  const cropName = searchParams.get('cropName');

  if (!cropProfileId && !cropName) {
    return NextResponse.json({ error: 'Crop ID or Name required' }, { status: 400, headers: NO_CACHE_HEADERS });
  }

  const targetCropName = cropName || 'Tomato';
  const fallbackKnowledge = getCropKnowledge(targetCropName);

  try {
    const whereClause = cropProfileId ? { cropProfileId } : { cropProfile: { name: cropName } };
    
    let guide = await (prisma as any).cropCultivationGuide.findFirst({
      where: whereClause,
      include: {
        cropProfile: true,
        wateringSchedules: true,
        manureFertilizers: true,
        cultivationStages: {
          orderBy: { stageOrder: 'asc' }
        },
        pestDiseases: true
      }
    });

    let profile = guide?.cropProfile;
    if (!profile) {
      try {
        profile = cropProfileId 
          ? await (prisma as any).cropProfile.findUnique({ where: { id: cropProfileId } })
          : await (prisma as any).cropProfile.findUnique({ where: { name: cropName! } });
      } catch {
        profile = null;
      }
    }

    const effectiveCropName = cropName || profile?.name || targetCropName;
    const memCrop = inMemoryStore.getCropProfileByName(effectiveCropName);
    const knowledge = getCropKnowledge(effectiveCropName);

    const resolvedImageUrl = memCrop?.imageUrl || profile?.imageUrl || `/images/crops/${effectiveCropName.toLowerCase().replace(/\s+/g, '-')}.jpg`;

    // If no guide found in DB, construct full rich guide object from knowledge base
    if (!guide) {
      if (!profile) {
        profile = {
          id: memCrop?.id || cropProfileId || `profile_${effectiveCropName.toLowerCase().replace(/\s+/g, '_')}`,
          name: effectiveCropName,
          category: memCrop?.category || knowledge.category,
          scientificName: knowledge.scientificName,
          description: knowledge.description,
          climateRequirements: knowledge.climateRequirements,
          soilRequirements: knowledge.soilRequirements,
          expectedYield: memCrop?.expectedYield || knowledge.expectedYield,
          growingPeriod: memCrop?.growingPeriod || knowledge.growingPeriod,
          waterRequirement: memCrop?.waterRequirement ?? knowledge.waterRequirement,
          fertilizer: memCrop?.fertilizer || knowledge.fertilizer,
          pesticide: memCrop?.pesticide || knowledge.pesticide,
          imageUrl: resolvedImageUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any;
      } else {
        profile.imageUrl = resolvedImageUrl;
        if (!profile.description) profile.description = knowledge.description;
        if (!profile.scientificName) profile.scientificName = knowledge.scientificName;
        if (!profile.climateRequirements) profile.climateRequirements = knowledge.climateRequirements;
        if (!profile.soilRequirements) profile.soilRequirements = knowledge.soilRequirements;
      }

      const syntheticGuide = {
        id: `guide_${effectiveCropName.toLowerCase()}`,
        cropProfileId: profile.id,
        landPreparation: knowledge.landPreparation,
        seedInformation: knowledge.seedInformation,
        spacing: knowledge.spacing,
        plantingMethod: knowledge.plantingMethod,
        harvesting: knowledge.harvesting,
        postHarvest: knowledge.postHarvest,
        manureFertilizers: knowledge.manureFertilizers.map((m, i) => ({ id: `m_${i}`, ...m })),
        wateringSchedules: knowledge.wateringSchedules.map((w, i) => ({ id: `w_${i}`, ...w })),
        pestDiseases: knowledge.pestDiseases.map((p, i) => ({ id: `p_${i}`, ...p })),
        cultivationStages: knowledge.cultivationStages.map((s, i) => ({ id: `s_${i}`, ...s }))
      };

      return NextResponse.json({ success: true, guide: syntheticGuide, profile }, { headers: NO_CACHE_HEADERS });
    }

    if (profile) {
      profile.imageUrl = resolvedImageUrl;
    }

    return NextResponse.json({ success: true, guide, profile }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.warn("Guide fetch DB error, using synthetic fallback:", error?.message);
    const memCrop = inMemoryStore.getCropProfileByName(targetCropName);
    const syntheticProfile = {
      id: memCrop?.id || cropProfileId || `profile_${targetCropName.toLowerCase().replace(/\s+/g, '_')}`,
      name: targetCropName,
      category: memCrop?.category || fallbackKnowledge.category,
      scientificName: fallbackKnowledge.scientificName,
      description: fallbackKnowledge.description,
      climateRequirements: fallbackKnowledge.climateRequirements,
      soilRequirements: fallbackKnowledge.soilRequirements,
      expectedYield: memCrop?.expectedYield || fallbackKnowledge.expectedYield,
      growingPeriod: memCrop?.growingPeriod || fallbackKnowledge.growingPeriod,
      waterRequirement: memCrop?.waterRequirement ?? fallbackKnowledge.waterRequirement,
      fertilizer: memCrop?.fertilizer || fallbackKnowledge.fertilizer,
      pesticide: memCrop?.pesticide || fallbackKnowledge.pesticide,
      imageUrl: memCrop?.imageUrl || `/images/crops/${targetCropName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const syntheticGuide = {
      id: `guide_${targetCropName.toLowerCase()}`,
      cropProfileId: syntheticProfile.id,
      landPreparation: fallbackKnowledge.landPreparation,
      seedInformation: fallbackKnowledge.seedInformation,
      spacing: fallbackKnowledge.spacing,
      plantingMethod: fallbackKnowledge.plantingMethod,
      harvesting: fallbackKnowledge.harvesting,
      postHarvest: fallbackKnowledge.postHarvest,
      manureFertilizers: fallbackKnowledge.manureFertilizers.map((m, i) => ({ id: `m_${i}`, ...m })),
      wateringSchedules: fallbackKnowledge.wateringSchedules.map((w, i) => ({ id: `w_${i}`, ...w })),
      pestDiseases: fallbackKnowledge.pestDiseases.map((p, i) => ({ id: `p_${i}`, ...p })),
      cultivationStages: fallbackKnowledge.cultivationStages.map((s, i) => ({ id: `s_${i}`, ...s }))
    };
    return NextResponse.json({ success: true, guide: syntheticGuide, profile: syntheticProfile }, { headers: NO_CACHE_HEADERS });
  }
}

