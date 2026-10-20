import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

async function getUserId(request?: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const uid = (payload.userId || payload.id || (payload as any).sub) as string;
      if (uid) return uid;
    }
  } catch (err) {}

  if (request) {
    const headerUid = request.headers.get('x-user-id');
    if (headerUid) return headerUid;
  }

  return 'u-farmer-01';
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const body = await request.json().catch(() => ({}));
    const { equipmentId, startDate, endDate, totalCost } = body;
    
    if (!equipmentId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required booking details.' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (start < now) {
      return NextResponse.json({ error: 'Start date cannot be in the past.' }, { status: 400 });
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return NextResponse.json({ error: 'Minimum booking duration is 1 day.' }, { status: 400 });
    }

    try {
      const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
      if (!equipment) {
        throw new Error('Not in DB');
      }

      const conflictingBooking = await prisma.rentalBooking.findFirst({
        where: {
          equipmentId,
          status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } }
          ]
        }
      });

      if (conflictingBooking) {
        return NextResponse.json({ error: 'The selected dates conflict with an existing booking.' }, { status: 409 });
      }

      const booking = await prisma.rentalBooking.create({
        data: {
          equipmentId,
          renterId: userId,
          startDate: start,
          endDate: end,
          totalCost: Number(totalCost) || 2000,
          status: 'PENDING'
        }
      });

      return NextResponse.json({ success: true, booking });
    } catch (dbErr) {
      // In-memory fallback
      const booking = inMemoryStore.bookEquipment({
        equipmentId,
        farmerId: userId,
        startDate: startDate,
        endDate: endDate,
        totalCost: Number(totalCost) || 2200
      });

      return NextResponse.json({ success: true, booking });
    }
  } catch (error) {
    console.error('Failed to book equipment:', error);
    return NextResponse.json({ error: 'Unable to book equipment. Please try again.' }, { status: 500 });
  }
}
