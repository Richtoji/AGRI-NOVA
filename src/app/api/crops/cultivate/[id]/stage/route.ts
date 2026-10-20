import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(JWT_SECRET || 'fallback_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    const user = { ...payload, id: userId, userId: userId } as any;

    if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { stageId, imageUrl, farmerNotes } = await request.json();

    if (!stageId) return NextResponse.json({ error: 'Stage ID required' }, { status: 400 });
    if (!imageUrl) return NextResponse.json({ error: 'Please upload a crop photograph before submitting.' }, { status: 400 });

    const cultivation = await (prisma as any).farmerCultivation.findUnique({
      where: { id },
      include: {
        cropProfile: {
          include: {
            cultivationGuide: {
              include: {
                cultivationStages: { orderBy: { stageOrder: 'asc' } }
              }
            }
          }
        },
        stageSubmissions: true
      }
    });

    if (!cultivation || cultivation.farmerId !== user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const stages = cultivation.cropProfile?.cultivationGuide?.cultivationStages || [];
    let effectiveStage = stages.find((s: any) => s.id === stageId);
    if (!effectiveStage && typeof stageId === 'string' && stageId.startsWith('stage_')) {
      const order = parseInt(stageId.replace('stage_', ''), 10);
      effectiveStage = stages.find((s: any) => s.stageOrder === order);
    }
    if (!effectiveStage && stages.length > 0 && (stageId === 'first' || stageId === 'stage_1')) {
      effectiveStage = stages[0];
    }

    const targetStageIndex = effectiveStage 
      ? stages.findIndex((s: any) => s.id === effectiveStage.id) 
      : stages.findIndex((s: any) => s.id === stageId);

    if (targetStageIndex === -1 && stages.length > 0) {
      return NextResponse.json({ error: 'Invalid cultivation stage ID.' }, { status: 400 });
    }

    const finalStageId = effectiveStage?.id || stageId;

    // Backend stage locking enforcement:
    // If targetStageIndex > 0, all previous stages must be APPROVED!
    if (targetStageIndex > 0) {
      for (let i = 0; i < targetStageIndex; i++) {
        const prevStage = stages[i];
        const prevSub = cultivation.stageSubmissions.find((s: any) => s.stageId === prevStage.id);
        if (!prevSub || prevSub.status !== 'APPROVED') {
          return NextResponse.json({ 
            error: i === 0 
              ? "Stage 1 (Planting crop within 3 days & uploading photographic evidence) must be approved by an administrator before you can enter this stage. You can only view requirements for this stage."
              : `Stage ${i + 1} (${prevStage?.stageName || "Previous Stage"}) must be approved by an administrator before advancing to the next stage.`
          }, { status: 403 });
        }
      }
    }

    // Prevent duplicate pending reviews for the same stage
    const existingSubmission = cultivation.stageSubmissions.find(
      (s: any) => s.stageId === finalStageId && s.status === 'PENDING REVIEW'
    );
    if (existingSubmission) {
      return NextResponse.json({ 
        error: "A submission for this stage is already awaiting review." 
      }, { status: 400 });
    }

    // Create or update stage submission
    const submission = await (prisma as any).stageSubmission.create({
      data: {
        cultivationId: id,
        stageId: finalStageId,
        imageUrl,
        farmerNotes: farmerNotes || null,
        status: 'PENDING REVIEW',
        submittedAt: new Date()
      }
    });

    // Update cultivation status to PENDING ADMIN APPROVAL
    await (prisma as any).farmerCultivation.update({
      where: { id },
      data: {
        status: targetStageIndex === 0 ? 'PLANTING_PENDING' : 'ACTIVE',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Stage submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
