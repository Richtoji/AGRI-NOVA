import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { getCropKnowledge } from '@/data/cropKnowledge';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const JWT_SECRET = (process.env.JWT_SECRET || 'super_secure_production_ready_secret_12345').trim();


async function getUser() {
  if (!JWT_SECRET) return null;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    return {
      ...payload,
      id: userId,
      userId: userId,
      role: payload.role as string,
      email: payload.email as string
    };
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: NO_CACHE_HEADERS });

  try {
    let rawCultivations = await (prisma as any).farmerCultivation.findMany({
      where: { farmerId: user.id as string },
      include: {
        cropProfile: {
          include: {
            cultivationGuide: {
              include: {
                cultivationStages: { orderBy: { stageOrder: 'asc' } },
                wateringSchedules: true,
                manureFertilizers: true,
                pestDiseases: true
              }
            }
          }
        },
        activities: { orderBy: { scheduledDate: 'asc' } },
        stageSubmissions: { orderBy: { submittedAt: 'desc' } },
        weeklyPhotos: { orderBy: { weekNumber: 'asc' } }
      },
      orderBy: { startDate: 'desc' }
    });

    if (rawCultivations && rawCultivations.length > 0) {
      const cultivations = rawCultivations.map((c: any) => {
        const cropName = c.cropProfile?.name || 'Crop';
        const knowledge = getCropKnowledge(cropName);
        const memCrop = inMemoryStore.getCropProfileByName(cropName);

        if (memCrop && c.cropProfile) {
          if (memCrop.imageUrl) c.cropProfile.imageUrl = memCrop.imageUrl;
          if (memCrop.expectedYield) c.cropProfile.expectedYield = memCrop.expectedYield;
          if (memCrop.growingPeriod) c.cropProfile.growingPeriod = memCrop.growingPeriod;
        }

        if (!c.cropProfile?.cultivationGuide || !c.cropProfile.cultivationGuide.cultivationStages || c.cropProfile.cultivationGuide.cultivationStages.length === 0) {
          c.cropProfile.cultivationGuide = {
            ...(c.cropProfile?.cultivationGuide || {}),
            id: c.cropProfile?.cultivationGuide?.id || 'guide_fallback',
            cropProfileId: c.cropProfile?.id,
            landPreparation: c.cropProfile?.cultivationGuide?.landPreparation || knowledge.landPreparation,
            seedInformation: c.cropProfile?.cultivationGuide?.seedInformation || knowledge.seedInformation,
            spacing: c.cropProfile?.cultivationGuide?.spacing || knowledge.spacing,
            plantingMethod: c.cropProfile?.cultivationGuide?.plantingMethod || knowledge.plantingMethod,
            harvesting: c.cropProfile?.cultivationGuide?.harvesting || knowledge.harvesting,
            postHarvest: c.cropProfile?.cultivationGuide?.postHarvest || knowledge.postHarvest,
            cultivationStages: knowledge.cultivationStages.map((s, i) => ({ id: `stage_${i + 1}`, ...s })),
            wateringSchedules: knowledge.wateringSchedules.map((w, i) => ({ id: `water_${i + 1}`, ...w })),
            manureFertilizers: knowledge.manureFertilizers.map((m, i) => ({ id: `manure_${i + 1}`, ...m, inputType: m.isOrganic ? 'Organic Manure' : 'Chemical Fertilizer', quantity: String(m.quantity) })),
            pestDiseases: knowledge.pestDiseases.map((p, i) => ({ id: `pest_${i + 1}`, ...p }))
          };
        }
        return c;
      });

      return NextResponse.json({ success: true, cultivations }, { headers: NO_CACHE_HEADERS });
    }
  } catch (error: any) {
    console.warn("Prisma fetch cultivations failed, using fallback:", error?.message);
  }

  const memoryCultivations = inMemoryStore.getCultivations(user.id);
  return NextResponse.json({ success: true, cultivations: memoryCultivations }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  let body: any = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch (e) {
    body = {};
  }

  try {
    let { cropProfileId, cropName, region, startDate } = body;

    let targetProfile = null;
    if (cropProfileId) {
      try {
        targetProfile = await prisma.cropProfile.findUnique({ where: { id: cropProfileId } });
      } catch (e) {
        targetProfile = null;
      }
    }

    if (!targetProfile && cropName) {
      try {
        targetProfile = await prisma.cropProfile.findFirst({
          where: {
            OR: [
              { name: { equals: cropName, mode: 'insensitive' } },
              { name: cropName }
            ]
          }
        });
      } catch (e) {
        targetProfile = await prisma.cropProfile.findFirst({ where: { name: cropName } });
      }
    }

    if (!targetProfile && cropProfileId) {
      try {
        targetProfile = await prisma.cropProfile.findFirst({
          where: {
            OR: [
              { name: { equals: cropProfileId, mode: 'insensitive' } },
              { name: cropProfileId }
            ]
          }
        });
      } catch (e) {}
    }

    // If profile still doesn't exist in DB, create it from crop knowledge
    if (!targetProfile) {
      const finalCropName = cropName || (cropProfileId && cropProfileId.length < 30 ? cropProfileId : 'Coconut');
      const knowledge = getCropKnowledge(finalCropName);

      try {
        targetProfile = await (prisma as any).cropProfile.create({
          data: {
            name: finalCropName,
            category: knowledge.category,
            scientificName: knowledge.scientificName,
            description: knowledge.description,
            climateRequirements: knowledge.climateRequirements,
            soilRequirements: knowledge.soilRequirements,
            expectedYield: knowledge.expectedYield || 'Good Yield',
            growingPeriod: knowledge.growingPeriod || 'Seasonal',
            waterRequirement: typeof knowledge.waterRequirement === 'number' ? knowledge.waterRequirement : 3.0,
            fertilizer: knowledge.fertilizer || 'Balanced Fertilizer',
            pesticide: knowledge.pesticide || 'Neem oil formulation',
            imageUrl: `/images/crops/${finalCropName.toLowerCase().replace(/\s+/g, '-')}.jpg`
          }
        });
      } catch (createErr) {
        targetProfile = await prisma.cropProfile.findFirst({
          where: {
            OR: [
              { name: { equals: finalCropName, mode: 'insensitive' } },
              { name: finalCropName }
            ]
          }
        });
      }
    }

    if (!targetProfile) {
      targetProfile = await prisma.cropProfile.findFirst();
    }

    if (!targetProfile) {
      throw new Error(`Could not find or create crop profile for "${cropName || 'Crop'}"`);
    }

    // Ensure CropCultivationGuide and CultivationStages exist for this profile
    let guide = await (prisma as any).cropCultivationGuide.findUnique({
      where: { cropProfileId: targetProfile.id },
      include: { cultivationStages: true }
    });

    const knowledge = getCropKnowledge(targetProfile.name);

    if (!guide) {
      try {
        guide = await (prisma as any).cropCultivationGuide.create({
          data: {
            cropProfileId: targetProfile.id,
            landPreparation: knowledge.landPreparation || '',
            seedInformation: knowledge.seedInformation || '',
            spacing: knowledge.spacing || '',
            plantingMethod: knowledge.plantingMethod || '',
            harvesting: knowledge.harvesting || '',
            postHarvest: knowledge.postHarvest || '',
            cultivationStages: {
              create: (knowledge.cultivationStages || []).map(s => ({
                stageOrder: s.stageOrder,
                stageName: s.stageName,
                startDay: s.startDay,
                endDay: s.endDay,
                description: s.description,
                waterReq: s.waterReq,
                manureReq: s.manureReq,
                careInstructions: s.careInstructions
              }))
            }
          },
          include: { cultivationStages: true }
        });
      } catch (nestedErr) {
        console.warn("Could not create nested guide, trying simple guide query:", nestedErr);
        guide = await (prisma as any).cropCultivationGuide.findUnique({
          where: { cropProfileId: targetProfile.id },
          include: { cultivationStages: true }
        });
      }
    } else if (!guide.cultivationStages || guide.cultivationStages.length === 0) {
      // Seed stages if missing
      await (prisma as any).cultivationStage.createMany({
        data: (knowledge.cultivationStages || []).map(s => ({
          guideId: guide.id,
          stageOrder: s.stageOrder,
          stageName: s.stageName,
          startDay: s.startDay,
          endDay: s.endDay,
          description: s.description,
          waterReq: s.waterReq,
          manureReq: s.manureReq,
          careInstructions: s.careInstructions
        }))
      }).catch(() => null);
    }

    const stagesList = await (prisma as any).cultivationStage.findMany({
      where: { guideId: guide?.id || '' },
      orderBy: { stageOrder: 'asc' }
    });
    const firstStage = stagesList?.[0] || null;

    // Check if farmer already has an ongoing cultivation for this crop
    const existingCultivation = await (prisma as any).farmerCultivation.findFirst({
      where: {
        farmerId: user.id as string,
        cropProfileId: targetProfile.id,
        status: { in: ['PLANTING_PENDING', 'ACTIVE'] }
      },
      include: {
        cropProfile: {
          include: {
            cultivationGuide: {
              include: {
                cultivationStages: { orderBy: { stageOrder: 'asc' } },
                wateringSchedules: true,
                manureFertilizers: true,
                pestDiseases: true
              }
            }
          }
        },
        activities: { orderBy: { scheduledDate: 'asc' } },
        stageSubmissions: { orderBy: { submittedAt: 'desc' } },
        weeklyPhotos: { orderBy: { weekNumber: 'asc' } }
      }
    });

    if (existingCultivation) {
      if (body.restart || body.forceNew || existingCultivation.status === 'ACTIVE') {
        try {
          await (prisma as any).cultivationActivity.deleteMany({ where: { cultivationId: existingCultivation.id } }).catch(() => null);
          await (prisma as any).stageSubmission.deleteMany({ where: { cultivationId: existingCultivation.id } }).catch(() => null);
          await (prisma as any).weeklyGrowthRecord.deleteMany({ where: { cultivationId: existingCultivation.id } }).catch(() => null);

          const updatedCultivation = await (prisma as any).farmerCultivation.update({
            where: { id: existingCultivation.id },
            data: {
              region: region || "Local Farm Region",
              startDate: startDate ? new Date(startDate) : new Date(),
              status: 'PLANTING_PENDING',
              currentStageId: firstStage?.id || null,
              progress: 0,
              weeklyPhotoStatus: 'NOT DUE'
            },
            include: {
              cropProfile: {
                include: {
                  cultivationGuide: {
                    include: {
                      cultivationStages: { orderBy: { stageOrder: 'asc' } },
                      wateringSchedules: true,
                      manureFertilizers: true,
                      pestDiseases: true
                    }
                  }
                }
              },
              activities: { orderBy: { scheduledDate: 'asc' } },
              stageSubmissions: { orderBy: { submittedAt: 'desc' } },
              weeklyPhotos: { orderBy: { weekNumber: 'asc' } }
            }
          });

          // Re-create activities
          const activities = [
            {
              cultivationId: updatedCultivation.id,
              activityName: "Stage 1: Seed Sowing & Sapling Planting",
              activityType: "PLANTING",
              scheduledDate: new Date(updatedCultivation.startDate)
            }
          ];

          for (const stage of knowledge.cultivationStages) {
            if (stage.startDay > 0) {
              const d = new Date(updatedCultivation.startDate);
              d.setDate(d.getDate() + stage.startDay);
              activities.push({
                cultivationId: updatedCultivation.id,
                activityName: `${stage.stageName}`,
                activityType: "STAGE_TRANSITION",
                scheduledDate: d
              });
            }
          }

          for (const act of activities) {
            await (prisma as any).cultivationActivity.create({ data: act }).catch(() => null);
          }

          return NextResponse.json({ success: true, cultivation: updatedCultivation });
        } catch (delErr) {
          console.warn("Could not update existing cultivation, proceeding to create new:", delErr);
        }
      } else {
        return NextResponse.json({ success: true, cultivation: existingCultivation, alreadyExists: true });
      }
    }

    const cultivation = await (prisma as any).farmerCultivation.create({
      data: {
        farmerId: user.id as string,
        cropProfileId: targetProfile.id,
        region: region || "Local Farm Region",
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'PLANTING_PENDING',
        currentStageId: firstStage?.id || null,
        progress: 0,
        weeklyPhotoStatus: 'NOT DUE'
      },
      include: {
        cropProfile: {
          include: {
            cultivationGuide: {
              include: {
                cultivationStages: { orderBy: { stageOrder: 'asc' } },
                wateringSchedules: true,
                manureFertilizers: true,
                pestDiseases: true
              }
            }
          }
        },
        activities: { orderBy: { scheduledDate: 'asc' } },
        stageSubmissions: { orderBy: { submittedAt: 'desc' } },
        weeklyPhotos: { orderBy: { weekNumber: 'asc' } }
      }
    });

    // Create activity timeline
    const activities = [];
    const start = new Date(cultivation.startDate);

    activities.push({
      cultivationId: cultivation.id,
      activityName: "Stage 1: Seed Sowing & Sapling Planting",
      activityType: "PLANTING",
      scheduledDate: new Date(start)
    });

    for (const stage of knowledge.cultivationStages) {
      if (stage.startDay > 0) {
        const d = new Date(start);
        d.setDate(d.getDate() + stage.startDay);
        activities.push({
          cultivationId: cultivation.id,
          activityName: `${stage.stageName}`,
          activityType: "STAGE_TRANSITION",
          scheduledDate: d
        });
      }
    }

    if (activities.length > 0) {
      try {
        await (prisma as any).cultivationActivity.createMany({ data: activities });
      } catch (actErr) {
        for (const act of activities) {
          await (prisma as any).cultivationActivity.create({ data: act }).catch(() => null);
        }
      }
    }

    return NextResponse.json({ success: true, cultivation });
  } catch (error: any) {
    console.warn("Failed to start cultivation in DB, falling back to inMemoryStore:", error?.message);
    const fallbackCropName = body?.cropName || body?.cropProfileId || 'Tomato';
    const fallbackRegion = body?.region || 'Kerala Farm Region';
    const fallbackCultivation = inMemoryStore.startCultivation(user.id, fallbackCropName, fallbackRegion);
    return NextResponse.json({ success: true, cultivation: fallbackCultivation });
  }
}
