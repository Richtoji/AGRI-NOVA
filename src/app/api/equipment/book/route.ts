import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

async function getUserId() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch (err) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Please log in to book equipment.' }, { status: 401 });
    }

    const { equipmentId, startDate, endDate, totalCost } = await request.json();
    
    if (!equipmentId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required booking details.' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    const now = new Date();
    now.setHours(0, 0, 0, 0); // reset to midnight for start date comparison
    
    if (start < now) {
      return NextResponse.json({ error: 'Start date cannot be in the past.' }, { status: 400 });
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return NextResponse.json({ error: 'Minimum booking duration is 1 day.' }, { status: 400 });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return NextResponse.json({ error: 'This equipment is currently unavailable.' }, { status: 404 });
    }

    // Check for conflicts
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
        totalCost,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Failed to book equipment:', error);
    return NextResponse.json({ error: 'Unable to book equipment. Please try again.' }, { status: 500 });
  }
}
