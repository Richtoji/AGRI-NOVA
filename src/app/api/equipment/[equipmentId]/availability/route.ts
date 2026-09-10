import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { equipmentId: string } }
) {
  try {
    const { equipmentId } = params;

    if (!equipmentId) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    const bookings = await prisma.rentalBooking.findMany({
      where: {
        equipmentId: equipmentId,
        status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
        endDate: { gte: new Date() } // Only return future or ongoing bookings
      },
      select: {
        startDate: true,
        endDate: true
      }
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
