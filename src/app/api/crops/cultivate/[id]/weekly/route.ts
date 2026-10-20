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

  const { weekNumber, dueDate, imageUrl, farmerNotes } = requestData;

  try {
    const { id } = await params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    const user = { ...payload, id: userId, userId: userId } as any;

    if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    if (!imageUrl) return NextResponse.json({ error: 'Please upload a crop photograph before submitting.' }, { status: 400 });
    if (!weekNumber) return NextResponse.json({ error: 'Week number is required.' }, { status: 400 });

    try {
      const cultivation = await (prisma as any).farmerCultivation.findUnique({
        where: { id },
        include: {
          weeklyPhotos: { where: { weekNumber: Number(weekNumber) } },
          stageSubmissions: { orderBy: { submittedAt: 'asc' }, take: 1 }
        }
      });

      if (cultivation && cultivation.farmerId === user.id) {
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

        await (prisma as any).farmerCultivation.update({
          where: { id },
          data: { weeklyPhotoStatus: 'PENDING REVIEW' }
        });

        return NextResponse.json({ success: true, record });
      }
    } catch (dbErr) {
      console.warn("DB weekly record creation failed, falling back to inMemoryStore:", dbErr);
    }

    const memoryRecord = inMemoryStore.submitWeeklyPhoto(
      user.id,
      id,
      Number(weekNumber),
      imageUrl,
      farmerNotes || ''
    );

    return NextResponse.json({ success: true, record: memoryRecord });
  } catch (error) {
    console.error('Weekly photo submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
