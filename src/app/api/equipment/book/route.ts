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

    const { equipmentId, days, totalCost } = await request.json();
    
    if (!equipmentId || typeof days !== 'number' || days < 1) {
      return NextResponse.json({ error: 'Invalid booking details.' }, { status: 400 });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return NextResponse.json({ error: 'This equipment is currently unavailable.' }, { status: 404 });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const booking = await prisma.rentalBooking.create({
      data: {
        equipmentId,
        renterId: userId,
        startDate,
        endDate,
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
