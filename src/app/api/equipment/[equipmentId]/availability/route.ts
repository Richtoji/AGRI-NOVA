import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const { equipmentId } = await params;

    if (!equipmentId) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    try {
      const bookings = await prisma.rentalBooking.findMany({
        where: {
          equipmentId: equipmentId,
          status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
          endDate: { gte: new Date() }
        },
        select: {
          startDate: true,
          endDate: true
        }
      });
      return NextResponse.json({ bookings });
    } catch (dbErr) {
      console.warn("DB availability check failed, checking inMemoryStore:", dbErr);
    }

    const memoryBookings = inMemoryStore.getEquipmentBookings().filter(b => b.equipmentId === equipmentId);
    const bookings = memoryBookings.map(b => ({ startDate: b.startDate, endDate: b.endDate }));
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ bookings: [] });
  }
}
