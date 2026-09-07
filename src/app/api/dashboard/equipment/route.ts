import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const prisma = new PrismaClient();

async function getUserId() {
  const JWT_SECRET = process.env.JWT_SECRET;
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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const equipment = await prisma.equipment.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, equipment });
  } catch (error) {
    console.error('Failed to fetch user equipment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, dailyRate, hourlyRate, imageUrl, locationName, available } = body;

    if (!name || !category || !dailyRate || !hourlyRate || !imageUrl || !locationName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, equipment: newEquipment });
  } catch (error) {
    console.error('Failed to create equipment:', error);
    return NextResponse.json({ error: 'Unable to add equipment.' }, { status: 500 });
  }
}
