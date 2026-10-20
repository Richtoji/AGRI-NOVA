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

    const { weekNumber, dueDate, imageUrl, farmerNotes } = await request.json();

    if (!imageUrl) return NextResponse.json({ error: 'Please upload a crop photograph before submitting.' }, { status: 400 });
    if (!weekNumber) return NextResponse.json({ error: 'Week number is required.' }, { status: 400 });

    const cultivation = await (prisma as any).farmerCultivation.findUnique({
      where: { id },
      include: {
        weeklyPhotos: { where: { weekNumber: Number(weekNumber) } },
        stageSubmissions: { orderBy: { submittedAt: 'asc' }, take: 1 }
      }
    });

    if (!cultivation || cultivation.farmerId !== user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // Check if initial planting has been approved
    if (cultivation.status === 'PLANTING_PENDING') {
      const initialSubmission = cultivation.stageSubmissions[0];
      if (!initialSubmission || initialSubmission.status !== 'APPROVED') {
        return NextResponse.json({ 
          error: "Initial planting verification must be approved by the administrator before weekly growth tracking can commence." 
        }, { status: 403 });
      }
    }

    // Prevent duplicate pending or approved submissions for the same week
    const existingActiveRecord = cultivation.weeklyPhotos.find(
      (r: any) => r.status === 'PENDING REVIEW' || r.status === 'APPROVED'
    );
    if (existingActiveRecord) {
      return NextResponse.json({ 
        error: "A submission for this week is already awaiting review or has been approved." 
      }, { status: 400 });
    }

    const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(new Date(cultivation.startDate).getTime() + (Number(weekNumber) * 7 * 24 * 60 * 60 * 1000));

    const record = await (prisma as any).weeklyGrowthRecord.create({
      data: {
        cultivationId: id,
        weekNumber: Number(weekNumber),
        dueDate: calculatedDueDate,
        imageUrl,
        farmerNotes: farmerNotes || null,
        status: 'PENDING REVIEW',
        submittedAt: new Date()
      }
    });

    // Update cultivation weekly photo status
    await (prisma as any).farmerCultivation.update({
      where: { id },
      data: { weeklyPhotoStatus: 'PENDING REVIEW' }
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Weekly photo submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
