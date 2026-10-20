import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCropKnowledge } from '@/data/cropKnowledge';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cropProfileId = searchParams.get('cropProfileId');
  const cropName = searchParams.get('cropName');

  if (!cropProfileId && !cropName) {
    return NextResponse.json({ error: 'Crop ID or Name required' }, { status: 400 });
  }

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
      profile = cropProfileId 
        ? await prisma.cropProfile.findUnique({ where: { id: cropProfileId } })
        : await prisma.cropProfile.findUnique({ where: { name: cropName! } });
    }

    const targetCropName = cropName || profile?.name || 'Crop';
    const fallbackKnowledge = getCropKnowledge(targetCropName);

    // If no guide found in DB, construct full rich guide object from knowledge base
    if (!guide) {
      if (!profile) {
        profile = {
          id: cropProfileId || `profile_${targetCropName.toLowerCase().replace(/\s+/g, '_')}`,
          name: targetCropName,
          category: fallbackKnowledge.category,
          scientificName: fallbackKnowledge.scientificName,
          description: fallbackKnowledge.description,
          climateRequirements: fallbackKnowledge.climateRequirements,
          soilRequirements: fallbackKnowledge.soilRequirements,
          expectedYield: fallbackKnowledge.expectedYield,
          growingPeriod: fallbackKnowledge.growingPeriod,
          waterRequirement: fallbackKnowledge.waterRequirement,
          fertilizer: fallbackKnowledge.fertilizer,
          pesticide: fallbackKnowledge.pesticide,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any;
      } else {
        // Enrich profile if empty
        if (!profile.description) profile.description = fallbackKnowledge.description;
        if (!profile.scientificName) profile.scientificName = fallbackKnowledge.scientificName;
        if (!profile.climateRequirements) profile.climateRequirements = fallbackKnowledge.climateRequirements;
        if (!profile.soilRequirements) profile.soilRequirements = fallbackKnowledge.soilRequirements;
      }

      const syntheticGuide = {
        id: `guide_${targetCropName.toLowerCase()}`,
        cropProfileId: profile.id,
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

      return NextResponse.json({ success: true, guide: syntheticGuide, profile });
    }

    return NextResponse.json({ success: true, guide, profile });
  } catch (error: any) {
    console.error("Guide fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
}
