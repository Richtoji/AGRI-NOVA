import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'agrinova_fallback_jwt_secret_production_key_32chars';

async function checkAdminAuth() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role === 'ADMIN';
  } catch (err) {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    try {
      const where = location ? { location: { contains: location, mode: 'insensitive' as any } } : {};
      const recommendations = await prisma.livestockRecommendation.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
      if (recommendations && recommendations.length > 0) {
        return NextResponse.json({ success: true, recommendations });
      }
    } catch (dbErr) {
      console.warn('Prisma livestock recommendations fetch failed, falling back to inMemoryStore:', dbErr);
    }

    // Fallback to inMemoryStore
    const recommendations = inMemoryStore.getLivestockRecommendations(location || undefined);
    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    console.error('Failed to fetch livestock recommendations:', error);
    const recommendations = inMemoryStore.getLivestockRecommendations();
    return NextResponse.json({ success: true, recommendations });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const { breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl, category } = body;

    try {
      const rec = await prisma.livestockRecommendation.create({
        data: { breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl }
      });
      inMemoryStore.addLivestockRecommendation({
        ...rec,
        category: category || "Cattle"
      });
      return NextResponse.json({ success: true, recommendation: rec });
    } catch (dbErr) {
      console.warn('Prisma create recommendation failed, falling back to inMemoryStore:', dbErr);
      const rec = inMemoryStore.addLivestockRecommendation({
        breedName,
        location,
        expectedYield,
        fatContent,
        maintenanceLevel,
        imageUrl,
        category: category || "Cattle"
      });
      return NextResponse.json({ success: true, recommendation: rec });
    }
  } catch (error) {
    console.error('Failed to add livestock recommendation:', error);
    return NextResponse.json({ error: 'Unable to add.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const { id, breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl, category } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
      const rec = await prisma.livestockRecommendation.update({
        where: { id },
        data: { breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl }
      });
      inMemoryStore.updateLivestockRecommendation(id, {
        breedName,
        location,
        expectedYield,
        fatContent,
        maintenanceLevel,
        imageUrl,
        category
      });
      return NextResponse.json({ success: true, recommendation: rec });
    } catch (dbErr) {
      console.warn('Prisma update recommendation failed, updating inMemoryStore:', dbErr);
      const updated = inMemoryStore.updateLivestockRecommendation(id, {
        breedName,
        location,
        expectedYield,
        fatContent,
        maintenanceLevel,
        imageUrl,
        category
      });
      return NextResponse.json({ success: true, recommendation: updated });
    }
  } catch (error) {
    console.error('Failed to update livestock recommendation:', error);
    return NextResponse.json({ error: 'Unable to update.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
      await prisma.livestockRecommendation.delete({ where: { id } });
    } catch (dbErr) {
      console.warn('Prisma delete recommendation failed, deleting from inMemoryStore:', dbErr);
    }
    inMemoryStore.deleteLivestockRecommendation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete livestock recommendation:', error);
    return NextResponse.json({ error: 'Unable to delete.' }, { status: 500 });
  }
}
