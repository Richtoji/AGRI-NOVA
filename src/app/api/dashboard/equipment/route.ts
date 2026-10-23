import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

async function getUserId(request?: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const uid = (payload.userId || payload.id || (payload as any).sub) as string;
      if (uid) return uid;
    }
  } catch (err) {}

  if (request) {
    const headerUid = request.headers.get('x-user-id');
    if (headerUid) return headerUid;
  }

  return 'u-equipment-01';
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);

    try {
      const equipment = await prisma.equipment.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' }
      });

      if (equipment && equipment.length > 0) {
        return NextResponse.json({ success: true, equipment });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const fallbackList = inMemoryStore.getEquipment({ ownerId: userId });
    return NextResponse.json({ success: true, equipment: fallbackList });
  } catch (error) {
    console.error('Failed to fetch user equipment:', error);
    const fallbackList = inMemoryStore.getEquipment({ ownerId: 'u-equipment-01' });
    return NextResponse.json({ success: true, equipment: fallbackList });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const body = await request.json().catch(() => ({}));
    const { name, category, dailyRate, hourlyRate, imageUrl, locationName, available } = body;

    if (!name || !category || !dailyRate || !hourlyRate || !imageUrl || !locationName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    try {
      const newEquipment = await prisma.equipment.create({
        data: {
          ownerId: userId,
          name: name.trim(),
          category: category.trim(),
          dailyRate: Number(dailyRate),
          hourlyRate: Number(hourlyRate),
          imageUrl: imageUrl.trim(),
          locationName: locationName.trim(),
          available: available !== undefined ? available : true,
        }
      });

      inMemoryStore.addEquipment(userId, {
        id: newEquipment.id,
        name: name.trim(),
        category: category.trim(),
        dailyRate: Number(dailyRate),
        hourlyRate: Number(hourlyRate),
        imageUrl: imageUrl.trim(),
        locationName: locationName.trim(),
        available: available !== undefined ? available : true,
      });

      return NextResponse.json({ success: true, equipment: newEquipment });
    } catch (dbErr) {
      const newEquipment = inMemoryStore.addEquipment(userId, {
        name: name.trim(),
        category: category.trim(),
        dailyRate: Number(dailyRate),
        hourlyRate: Number(hourlyRate),
        imageUrl: imageUrl.trim(),
        locationName: locationName.trim(),
        available: available !== undefined ? available : true,
      });

      return NextResponse.json({ success: true, equipment: newEquipment });
    }
  } catch (error) {
    console.error('Failed to create equipment:', error);
    return NextResponse.json({ error: 'Unable to add equipment.' }, { status: 500 });
  }
}
