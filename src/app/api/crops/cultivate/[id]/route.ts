import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { getCropKnowledge } from '@/data/cropKnowledge';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = (process.env.JWT_SECRET || 'super_secure_production_ready_secret_12345').trim();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(JWT_SECRET || 'fallback_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    const user = { ...payload, id: userId, userId: userId } as any;

    if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    let cultivation = await (prisma as any).farmerCultivation.findUnique({
      where: { id },
      include: {
        cropProfile: {
          include: {
            cultivationGuide: {
              include: {
                cultivationStages: {
                  orderBy: { stageOrder: 'asc' }
                },
                wateringSchedules: true,
                manureFertilizers: true,
                pestDiseases: true
              }
            }
          }
        },
        activities: { orderBy: { scheduledDate: 'asc' } },
        stageSubmissions: true,
        weeklyPhotos: { orderBy: { weekNumber: 'asc' } }
      }
    });

    if (!cultivation || cultivation.farmerId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // If cultivation guide or stages missing, inject rich fallback from knowledge base
    const cropName = cultivation.cropProfile?.name || 'Crop';
    const knowledge = getCropKnowledge(cropName);

    if (!cultivation.cropProfile.cultivationGuide || !cultivation.cropProfile.cultivationGuide.cultivationStages || cultivation.cropProfile.cultivationGuide.cultivationStages.length === 0) {
      cultivation.cropProfile.cultivationGuide = {
        ...(cultivation.cropProfile?.cultivationGuide || {}),
        id: cultivation.cropProfile?.cultivationGuide?.id || 'guide_fallback',
        cropProfileId: cultivation.cropProfile.id,
        landPreparation: cultivation.cropProfile?.cultivationGuide?.landPreparation || knowledge.landPreparation,
        seedInformation: cultivation.cropProfile?.cultivationGuide?.seedInformation || knowledge.seedInformation,
        spacing: cultivation.cropProfile?.cultivationGuide?.spacing || knowledge.spacing,
        plantingMethod: cultivation.cropProfile?.cultivationGuide?.plantingMethod || knowledge.plantingMethod,
        harvesting: cultivation.cropProfile?.cultivationGuide?.harvesting || knowledge.harvesting,
        postHarvest: cultivation.cropProfile?.cultivationGuide?.postHarvest || knowledge.postHarvest,
        cultivationStages: knowledge.cultivationStages.map((s, i) => ({ id: `stage_${i+1}`, ...s })),
        wateringSchedules: knowledge.wateringSchedules.map((w, i) => ({ id: `water_${i+1}`, ...w })),
        manureFertilizers: knowledge.manureFertilizers.map((m, i) => ({ id: `manure_${i+1}`, ...m, inputType: m.isOrganic ? 'Organic Manure' : 'Chemical Fertilizer', quantity: String(m.quantity) })),
        pestDiseases: knowledge.pestDiseases.map((p, i) => ({ id: `pest_${i+1}`, ...p }))
      };
    }

    return NextResponse.json({ success: true, cultivation });
  } catch (error) {
    console.error('Fetch cultivation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(JWT_SECRET || 'fallback_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    const user = { ...payload, id: userId, userId: userId } as any;

    if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const cultivation = await (prisma as any).farmerCultivation.findUnique({ where: { id } });
    if (!cultivation || cultivation.farmerId !== user.id) {
      return NextResponse.json({ error: 'Cultivation not found or unauthorized' }, { status: 404 });
    }

    await (prisma as any).farmerCultivation.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Cultivation removed successfully' });
  } catch (error) {
    console.error('Delete cultivation error:', error);
    return NextResponse.json({ error: 'Failed to delete cultivation' }, { status: 500 });
  }
}
