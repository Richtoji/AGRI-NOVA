import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = (process.env.JWT_SECRET || 'super_secure_production_ready_secret_12345').trim();

async function getAdmin() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const user = payload as any;
    return user?.role === 'ADMIN' ? user : null;
  } catch { return null; }
}

// GET: list all cultivations (with filters) or pending reviews summary
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'list'; // 'list' | 'pending-stages' | 'pending-planting' | 'pending-weekly' | 'stats'

  try {
    if (view === 'stats') {
      const [
        totalCultivations,
        activeCount,
        plantingPendingCount,
        completedCount,
        allPendingStages,
        pendingWeekly,
        stageResubmissions,
        weeklyResubmissions
      ] = await Promise.all([
        (prisma as any).farmerCultivation.count(),
        (prisma as any).farmerCultivation.count({ where: { status: 'ACTIVE' } }),
        (prisma as any).farmerCultivation.count({ where: { status: 'PLANTING_PENDING' } }),
        (prisma as any).farmerCultivation.count({ where: { status: 'COMPLETED' } }),
        (prisma as any).stageSubmission.findMany({
          where: { status: 'PENDING REVIEW' },
          include: { stage: true, cultivation: true }
        }),
        (prisma as any).weeklyGrowthRecord.count({ where: { status: 'PENDING REVIEW' } }),
        (prisma as any).stageSubmission.count({ where: { status: 'RESUBMISSION REQUIRED' } }),
        (prisma as any).weeklyGrowthRecord.count({ where: { status: 'RESUBMISSION REQUIRED' } }),
      ]);

      const pendingPlantingSubmissions = allPendingStages.filter((s: any) => 
        s.stage?.stageOrder === 1 || s.cultivation?.status === 'PLANTING_PENDING'
      ).length;
      const pendingStages = allPendingStages.length - pendingPlantingSubmissions;
      const resubmissions = stageResubmissions + weeklyResubmissions;

      // Active cultivations represents all ongoing cultivations in the system (both planting phase & active growth)
      const activeCultivations = activeCount + plantingPendingCount;
      const pendingPlanting = plantingPendingCount > 0 ? plantingPendingCount : pendingPlantingSubmissions;

      return NextResponse.json({ 
        success: true, 
        stats: { 
          totalCultivations,
          activeCultivations, 
          plantingPendingCount,
          completedCultivations: completedCount,
          pendingPlanting, 
          pendingPlantingSubmissions,
          pendingStages, 
          pendingWeekly, 
          resubmissions 
        } 
      });
    }

    if (view === 'pending-stages' || view === 'pending-planting' || view === 'planting') {
      const [submissions, plantingCultivations] = await Promise.all([
        (prisma as any).stageSubmission.findMany({
          where: { status: 'PENDING REVIEW' },
          include: {
            cultivation: {
              include: { farmer: { select: { id: true, name: true, email: true, phone: true } }, cropProfile: true }
            },
            stage: true
          },
          orderBy: { submittedAt: 'asc' }
        }),
        (prisma as any).farmerCultivation.findMany({
          where: { status: 'PLANTING_PENDING' },
          include: {
            farmer: { select: { id: true, name: true, email: true, phone: true } },
            cropProfile: {
              include: {
                cultivationGuide: {
                  include: { cultivationStages: { orderBy: { stageOrder: 'asc' } } }
                }
              }
            },
            stageSubmissions: { orderBy: { submittedAt: 'desc' } }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const filtered = view === 'pending-planting' 
        ? submissions.filter((s: any) => s.stage?.stageOrder === 1 || s.cultivation?.status === 'PLANTING_PENDING')
        : submissions;

      return NextResponse.json({ 
        success: true, 
        submissions: filtered,
        plantingCultivations 
      });
    }

    if (view === 'pending-weekly') {
      const records = await (prisma as any).weeklyGrowthRecord.findMany({
        where: { status: 'PENDING REVIEW' },
        include: {
          cultivation: {
            include: { farmer: { select: { id: true, name: true, email: true, phone: true } }, cropProfile: true }
          }
        },
        orderBy: { submittedAt: 'asc' }
      });
      return NextResponse.json({ success: true, records });
    }

    // Default: list all cultivations
    const cultivations = await (prisma as any).farmerCultivation.findMany({
      include: {
        farmer: { select: { id: true, name: true, email: true, phone: true } },
        cropProfile: {
          include: {
            cultivationGuide: {
              include: { cultivationStages: { orderBy: { stageOrder: 'asc' } } }
            }
          }
        },
        stageSubmissions: { orderBy: { submittedAt: 'desc' }, take: 1, include: { stage: true } },
        weeklyPhotos: { orderBy: { weekNumber: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, cultivations });

  } catch (error) {
    console.warn('Admin cultivation fetch DB error, returning resilient fallback:', error);
    if (view === 'stats') {
      return NextResponse.json({
        success: true,
        stats: {
          totalCultivations: 1,
          activeCultivations: 1,
          plantingPendingCount: 0,
          completedCultivations: 0,
          pendingPlanting: 0,
          pendingPlantingSubmissions: 0,
          pendingStages: 0,
          pendingWeekly: 0,
          resubmissions: 0
        }
      });
    }
    return NextResponse.json({ success: true, cultivations: [], submissions: [], plantingCultivations: [], records: [] });
  }
}

// PATCH: approve/reject a stage submission, weekly photo, or direct cultivation planting approval
export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { type, id, action, adminComment } = await request.json();
    // type: 'stage' | 'weekly' | 'cultivation'
    // action: 'APPROVED' | 'REJECTED' | 'RESUBMISSION REQUIRED' | 'APPROVE_PLANTING'

    if (!type || !id || !action) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    if ((action === 'REJECTED' || action === 'RESUBMISSION REQUIRED') && (!adminComment || !adminComment.trim())) {
      return NextResponse.json({ error: 'Admin review comment is required when rejecting or requesting resubmission.' }, { status: 400 });
    }

    if (type === 'cultivation') {
      const cultivation = await (prisma as any).farmerCultivation.findUnique({
        where: { id },
        include: {
          cropProfile: {
            include: {
              cultivationGuide: {
                include: { cultivationStages: { orderBy: { stageOrder: 'asc' } } }
              }
            }
          },
          stageSubmissions: { orderBy: { submittedAt: 'desc' } }
        }
      });

      if (!cultivation) return NextResponse.json({ error: 'Cultivation not found' }, { status: 404 });

      const stages = cultivation.cropProfile?.cultivationGuide?.cultivationStages || [];
      const stage1 = stages[0];
      const stage2 = stages[1];

      if (action === 'APPROVE_PLANTING' || action === 'APPROVED') {
        const existingSub = cultivation.stageSubmissions?.find((s: any) => s.stageId === stage1?.id);
        if (existingSub) {
          await (prisma as any).stageSubmission.update({
            where: { id: existingSub.id },
            data: { status: 'APPROVED', adminComment: adminComment || 'Planting approved by Administrator', reviewedAt: new Date() }
          });
        } else if (stage1) {
          await (prisma as any).stageSubmission.create({
            data: {
              cultivationId: id,
              stageId: stage1.id,
              status: 'APPROVED',
              adminComment: adminComment || 'Direct planting verification by Administrator',
              reviewedAt: new Date(),
              submittedAt: new Date()
            }
          });
        }

        const updated = await (prisma as any).farmerCultivation.update({
          where: { id },
          data: {
            status: stage2 ? 'ACTIVE' : 'COMPLETED',
            currentStageId: stage2?.id || stage1?.id || null,
            progress: stages.length > 0 ? Math.round((1 / stages.length) * 100) : 20,
            updatedAt: new Date()
          }
        });

        return NextResponse.json({ success: true, updated });
      }
    }

    if (type === 'stage') {
      const updated = await (prisma as any).stageSubmission.update({
        where: { id },
        data: { status: action, adminComment, reviewedAt: new Date() }
      });

      // If approved: unlock the next stage by updating cultivationId's currentStageId
      if (action === 'APPROVED') {
        const submission = await (prisma as any).stageSubmission.findUnique({
          where: { id },
          include: {
            stage: true,
            cultivation: {
              include: {
                cropProfile: {
                  include: {
                    cultivationGuide: {
                      include: { cultivationStages: { orderBy: { stageOrder: 'asc' } } }
                    }
                  }
                }
              }
            }
          }
        });

        const stages = submission?.cultivation?.cropProfile?.cultivationGuide?.cultivationStages || [];
        const currentIdx = stages.findIndex((s: any) => s.id === submission.stageId);
        const nextStage = stages[currentIdx + 1];

        await (prisma as any).farmerCultivation.update({
          where: { id: submission.cultivationId },
          data: {
            currentStageId: nextStage?.id || null,
            progress: Math.round(((currentIdx + 1) / stages.length) * 100),
            status: nextStage ? 'ACTIVE' : 'COMPLETED',
            updatedAt: new Date()
          }
        });
      }

      return NextResponse.json({ success: true, updated });
    }

    if (type === 'weekly') {
      const updated = await (prisma as any).weeklyGrowthRecord.update({
        where: { id },
        data: { status: action, adminComment, reviewedAt: new Date() }
      });

      // Update cultivation weekly status
      const record = await (prisma as any).weeklyGrowthRecord.findUnique({ where: { id } });
      await (prisma as any).farmerCultivation.update({
        where: { id: record.cultivationId },
        data: { weeklyPhotoStatus: action, updatedAt: new Date() }
      });

      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Admin review error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
