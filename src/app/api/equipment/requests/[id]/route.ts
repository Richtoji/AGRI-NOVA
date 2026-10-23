import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || 'super_secure_production_ready_secret_12345').trim();

async function getUserId() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return 'u-equipment-01';
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return (payload.userId || payload.id || (payload as any).sub) as string;
  } catch (err) {
    return 'u-equipment-01';
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { status } = body;

    if (!status || !['APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    let updatedPrisma = null;
    try {
      const booking = await prisma.rentalBooking.findUnique({
        where: { id },
        include: { equipment: true }
      });

      if (booking) {
        updatedPrisma = await prisma.rentalBooking.update({
          where: { id },
          data: { status }
        });
      }
    } catch (dbErr) {
      console.warn("DB rental booking update failed, using inMemoryStore:", dbErr);
    }

    const memoryUpdated = inMemoryStore.updateEquipmentBookingStatus(id, status as any);
    return NextResponse.json({ 
      success: true, 
      rental: updatedPrisma || memoryUpdated || { id, status } 
    });
  } catch (error) {
    console.error('Failed to update rental request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
