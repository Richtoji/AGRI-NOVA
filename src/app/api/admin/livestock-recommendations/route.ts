import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const prisma = new PrismaClient();
const JWT_SECRET = (process.env.JWT_SECRET || 'super_secure_production_ready_secret_12345').trim();

async function checkAdminAuth() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role === 'ADMIN' || payload.role === 'VETERINARY_EXPERT';
  } catch (err) {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    let dbRecs: any[] = [];
    try {
      const where = location ? { location: { contains: location, mode: 'insensitive' as any } } : {};
      dbRecs = await prisma.livestockRecommendation.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    } catch (dbErr) {
      console.warn('Prisma livestock recommendations fetch failed:', dbErr);
    }

    const memRecs = inMemoryStore.getLivestockRecommendations(location || undefined);
    
    // Merge: In-memory store has live updates; merge dbRecs if not in memRecs
    const mergedMap = new Map<string, any>();
    for (const m of memRecs) {
      mergedMap.set(m.breedName.toLowerCase(), m);
      if (m.id) mergedMap.set(m.id, m);
    }
    for (const d of dbRecs) {
      const key = (d.breedName || '').toLowerCase();
      if (!mergedMap.has(key) && !mergedMap.has(d.id)) {
        mergedMap.set(key || d.id, d);
      }
    }
    const recommendations = Array.from(new Set(mergedMap.values()));
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

    let rec: any = null;
    try {
      rec = await prisma.livestockRecommendation.create({
        data: { breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl }
      });
    } catch (dbErr) {
      console.warn('Prisma create recommendation failed, falling back to inMemoryStore:', dbErr);
    }

    const memRec = inMemoryStore.addLivestockRecommendation({
      id: rec?.id,
      breedName,
      location,
      expectedYield,
      fatContent,
      maintenanceLevel,
      imageUrl,
      category: category || "Cattle"
    });

    return NextResponse.json({ success: true, recommendation: memRec || rec });
  } catch (error) {
    console.error('Failed to add livestock recommendation:', error);
    return NextResponse.json({ error: 'Unable to add.' }, { status: 500 });
  }
}

async function handleUpdate(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const { id, breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl, category } = body;

    if (!id && !breedName) return NextResponse.json({ error: 'ID or breedName required' }, { status: 400 });

    const updateData: any = {
      ...(breedName ? { breedName } : {}),
      ...(location ? { location } : {}),
      ...(expectedYield ? { expectedYield } : {}),
      ...(fatContent ? { fatContent } : {}),
      ...(maintenanceLevel ? { maintenanceLevel } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(category ? { category } : {})
    };

    let updatedPrismaRec: any = null;
    try {
      if (id) {
        updatedPrismaRec = await prisma.livestockRecommendation.update({
          where: { id },
          data: {
            ...(breedName ? { breedName } : {}),
            ...(location ? { location } : {}),
            ...(expectedYield ? { expectedYield } : {}),
            ...(fatContent ? { fatContent } : {}),
            ...(maintenanceLevel ? { maintenanceLevel } : {}),
            ...(imageUrl !== undefined ? { imageUrl } : {})
          }
        });
      }
    } catch (dbErr) {
      console.warn('Prisma update recommendation failed, updating inMemoryStore:', dbErr);
    }

    const updatedMem = inMemoryStore.updateLivestockRecommendation(id || breedName, updateData);
    return NextResponse.json({ 
      success: true, 
      recommendation: updatedMem || updatedPrismaRec || { id, ...updateData } 
    });
  } catch (error) {
    console.error('Failed to update livestock recommendation:', error);
    return NextResponse.json({ error: 'Unable to update.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleUpdate(request);
}

export async function PATCH(request: Request) {
  return handleUpdate(request);
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
