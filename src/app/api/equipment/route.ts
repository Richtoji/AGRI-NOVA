import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');

    const where: any = {};
    if (category) where.category = category;
    if (available !== null) where.available = available === 'true';

    const equipmentList = await prisma.equipment.findMany({
      where,
      include: {
        owner: {
          select: { name: true }
        }
      }
    });

    const formattedEquipment = equipmentList.map(eq => ({
      ...eq,
      ownerName: eq.owner.name,
      rating: 4.8 // Mock rating since rating isn't in Equipment schema natively
    }));

    return NextResponse.json({ success: true, equipment: formattedEquipment });
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    return NextResponse.json({ error: 'Unable to fetch equipment.' }, { status: 500 });
  }
}
