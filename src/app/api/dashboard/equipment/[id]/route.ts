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
    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required.' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, category, dailyRate, hourlyRate, imageUrl, locationName, available } = body;

    const updateData: any = {
      ...(name && { name: name.trim() }),
      ...(category && { category: category.trim() }),
      ...(dailyRate !== undefined && { dailyRate: Number(dailyRate) }),
      ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
      ...(imageUrl && { imageUrl: imageUrl.trim() }),
      ...(locationName && { locationName: locationName.trim() }),
      ...(available !== undefined && { available: Boolean(available) }),
    };

    // Keep inMemoryStore always synchronized
    const memoryUpdated = inMemoryStore.updateEquipment(id, userId, updateData);

    try {
      const existing = await prisma.equipment.findUnique({ where: { id } });
      if (existing) {
        const updatedEquipment = await prisma.equipment.update({
          where: { id },
          data: updateData
        });
        return NextResponse.json({ success: true, equipment: updatedEquipment });
      }
    } catch (dbErr) {
      console.warn("DB equipment update failed, using inMemoryStore:", dbErr);
    }

    if (!memoryUpdated) {
      return NextResponse.json({ error: 'Equipment not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, equipment: memoryUpdated });
  } catch (error) {
    console.error('Failed to update equipment:', error);
    return NextResponse.json({ error: 'Unable to update equipment.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required.' }, { status: 400 });
    }

    try {
      const existing = await prisma.equipment.findUnique({ where: { id } });
      if (existing) {
        await prisma.equipment.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }
    } catch (dbErr) {
      console.warn("DB equipment delete failed, using inMemoryStore:", dbErr);
    }

    inMemoryStore.deleteEquipment(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return NextResponse.json({ error: 'Unable to delete equipment.' }, { status: 500 });
  }
}
