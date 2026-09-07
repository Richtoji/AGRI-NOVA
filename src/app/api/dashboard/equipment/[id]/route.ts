import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function getUserId() {
  if (!JWT_SECRET) return null;
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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required.' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== userId) {
      return NextResponse.json({ error: 'Equipment not found or unauthorized.' }, { status: 404 });
    }

    const body = await request.json();
    const { name, category, dailyRate, hourlyRate, imageUrl, locationName, available } = body;

    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(category && { category: category.trim() }),
        ...(dailyRate && { dailyRate: Number(dailyRate) }),
        ...(hourlyRate && { hourlyRate: Number(hourlyRate) }),
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
        ...(locationName && { locationName: locationName.trim() }),
        ...(available !== undefined && { available }),
      }
    });

    return NextResponse.json({ success: true, equipment: updatedEquipment });
  } catch (error) {
    console.error('Failed to update equipment:', error);
    return NextResponse.json({ error: 'Unable to update equipment.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required.' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== userId) {
      return NextResponse.json({ error: 'Equipment not found or unauthorized.' }, { status: 404 });
    }

    await prisma.equipment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return NextResponse.json({ error: 'Unable to delete equipment.' }, { status: 500 });
  }
}
