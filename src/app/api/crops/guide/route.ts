import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCropKnowledge } from '@/data/cropKnowledge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cropProfileId = searchParams.get('cropProfileId');
  const cropName = searchParams.get('cropName');

  if (!cropProfileId && !cropName) {
    return NextResponse.json({ error: 'Crop ID or Name required' }, { status: 400 });
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
      profile = cropProfileId 
        ? await prisma.cropProfile.findUnique({ where: { id: cropProfileId } })
        : await prisma.cropProfile.findUnique({ where: { name: cropName! } });
    }

    const effectiveCropName = cropName || profile?.name || targetCropName;
    const knowledge = getCropKnowledge(effectiveCropName);

    // If no guide found in DB, construct full rich guide object from knowledge base
    if (!guide) {
      if (!profile) {
        profile = {
          id: cropProfileId || `profile_${effectiveCropName.toLowerCase().replace(/\s+/g, '_')}`,
          name: effectiveCropName,
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
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any;
      } else {
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

      return NextResponse.json({ success: true, guide: syntheticGuide, profile });
    }

    return NextResponse.json({ success: true, guide, profile });
  } catch (error: any) {
    console.warn("Guide fetch DB error, using synthetic fallback:", error?.message);
    const syntheticProfile = {
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
    return NextResponse.json({ success: true, guide: syntheticGuide, profile: syntheticProfile });
  }
}
