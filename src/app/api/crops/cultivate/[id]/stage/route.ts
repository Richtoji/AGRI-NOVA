import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || 'super_secure_production_ready_secret_12345').trim();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let requestData: any = {};
  try {
    requestData = await request.json().catch(() => ({}));
  } catch (e) {
    requestData = {};
  }

  const { stageId, imageUrl, farmerNotes } = requestData;

  try {
    const { id } = await params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    const user = { ...payload, id: userId, userId: userId } as any;

    if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    if (!stageId) return NextResponse.json({ error: 'Stage ID required' }, { status: 400 });
    if (!imageUrl) return NextResponse.json({ error: 'Please upload a crop photograph before submitting.' }, { status: 400 });

    try {
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

      if (cultivation && cultivation.farmerId === user.id) {
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

        const finalStageId = effectiveStage?.id || stageId;

        // Create stage submission
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

        await (prisma as any).farmerCultivation.update({
          where: { id },
          data: {
            status: targetStageIndex === 0 ? 'PLANTING_PENDING' : 'ACTIVE',
            updatedAt: new Date()
          }
        });

        return NextResponse.json({ success: true, submission });
      }
    } catch (dbErr) {
      console.warn("DB stage submission failed, falling back to inMemoryStore:", dbErr);
    }

    const memorySubmission = inMemoryStore.submitStageEvidence(
      user.id,
      id,
      stageId,
      imageUrl,
      farmerNotes || ''
    );

    return NextResponse.json({ success: true, submission: memorySubmission });
  } catch (error) {
    console.error('Stage submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
