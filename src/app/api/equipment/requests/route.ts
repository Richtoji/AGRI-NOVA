import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_development";

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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an equipment owner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'EQUIPMENT_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch rentals for the owner's equipment
    const rentals = await prisma.rentalBooking.findMany({
      where: {
        equipment: {
          ownerId: userId
        }
      },
      include: {
        equipment: true,
        renter: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ rentals });
  } catch (error) {
    console.error('Failed to fetch equipment requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
