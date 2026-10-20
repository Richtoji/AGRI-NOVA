import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const availableStr = searchParams.get('available');
    const available = availableStr !== null ? availableStr === 'true' : undefined;

    try {
      const where: any = {};
      if (category) where.category = category;
      if (available !== undefined) where.available = available;

      const equipmentList = await prisma.equipment.findMany({
        where,
        include: {
          owner: {
            select: { name: true }
          }
        }
      });

      if (equipmentList && equipmentList.length > 0) {
        const formattedEquipment = equipmentList.map(eq => ({
          ...eq,
          ownerName: eq.owner?.name || "Kisan Agro Rentals",
          rating: (eq as any).rating || 4.9
        }));
        return NextResponse.json({ success: true, equipment: formattedEquipment });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const fallbackList = inMemoryStore.getEquipment({ category, available });
    return NextResponse.json({ success: true, equipment: fallbackList });
  } catch (error) {
    const fallbackList = inMemoryStore.getEquipment();
    return NextResponse.json({ success: true, equipment: fallbackList });
  }
}
