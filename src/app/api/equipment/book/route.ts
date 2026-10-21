import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

async function getUserInfo(request?: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const uid = (payload.userId || payload.id || (payload as any).sub) as string;
      const role = (payload.role || (payload as any).role) as string;
      if (uid) return { userId: uid, role };
    }
  } catch (err) {}

  if (request) {
    const headerUid = request.headers.get('x-user-id');
    const headerRole = request.headers.get('x-user-role');
    if (headerUid) return { userId: headerUid, role: headerRole || '' };
  }

  return { userId: 'u-farmer-01', role: 'FARMER' };
}

export async function POST(request: Request) {
  try {
    const { userId, role } = await getUserInfo(request);

    // Admins are view-only and cannot book equipment
    if (role === 'ADMIN' || userId === 'u-admin-01') {
      return NextResponse.json(
        { error: 'Admins cannot book equipment. The admin role is restricted to audit and view-only permissions.' },
        { status: 403 }
      );
    }

    // Buyers are restricted to purchasing products and cannot book machinery
    if (role === 'BUYER' || userId === 'u-buyer-01') {
      return NextResponse.json(
        { error: 'Buyers cannot book agricultural machinery. Machinery rental is strictly reserved for farmers.' },
        { status: 403 }
      );
    }

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
