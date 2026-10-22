import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import jwt from 'jsonwebtoken';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();
const JWT_SECRET = (process.env.JWT_SECRET || 'super_secure_production_ready_secret_12345').trim();

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

async function checkAdminAuth(request?: Request): Promise<boolean> {
  try {
    const token = (await cookies()).get('auth_token')?.value;

    // Check request header fallback
    const roleHeader = request?.headers?.get('x-user-role');
    if (roleHeader && ['ADMIN', 'SUPER_ADMIN', 'VETERINARY_EXPERT'].includes(roleHeader)) {
      if (!token) return true;
    }

    if (!token) return false;

    // Try jsonwebtoken verification
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && ['ADMIN', 'SUPER_ADMIN', 'VETERINARY_EXPERT'].includes(decoded.role)) {
        return true;
      }
    } catch {
      // Ignore
    }

    // Try jose verification
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload && ['ADMIN', 'SUPER_ADMIN', 'VETERINARY_EXPERT'].includes(payload.role as string)) {
        return true;
      }
    } catch {
      // Ignore
    }

    return false;
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
      const key = (m.breedName || '').toLowerCase().trim();
      if (key) mergedMap.set(key, m);
      if (m.id) mergedMap.set(m.id.toLowerCase().trim(), m);
    }
    for (const d of dbRecs) {
      const key = (d.breedName || '').toLowerCase().trim();
      const idKey = (d.id || '').toLowerCase().trim();
      if (!mergedMap.has(key) && !mergedMap.has(idKey)) {
        mergedMap.set(key || idKey, d);
      }
    }
    const recommendations = Array.from(new Set(mergedMap.values()));
    return NextResponse.json({ success: true, recommendations }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Failed to fetch livestock recommendations:', error);
    const recommendations = inMemoryStore.getLivestockRecommendations();
    return NextResponse.json({ success: true, recommendations }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const { breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl, category, description, feedRequirement } = body;

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
      category: category || "Cattle",
      description,
      feedRequirement
    });

    return NextResponse.json({ success: true, recommendation: memRec || rec }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Failed to add livestock recommendation:', error);
    return NextResponse.json({ error: 'Unable to add.' }, { status: 500 });
  }
}

async function handleUpdate(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const { id, breedName, location, expectedYield, fatContent, maintenanceLevel, imageUrl, category, description, feedRequirement } = body;

    if (!id && !breedName) return NextResponse.json({ error: 'ID or breedName required' }, { status: 400 });

    const updateData: any = {
      ...(breedName ? { breedName: breedName.trim() } : {}),
      ...(location ? { location: location.trim() } : {}),
      ...(expectedYield ? { expectedYield: expectedYield.trim() } : {}),
      ...(fatContent ? { fatContent: fatContent.trim() } : {}),
      ...(maintenanceLevel ? { maintenanceLevel } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(category ? { category } : {}),
      ...(description ? { description } : {}),
      ...(feedRequirement ? { feedRequirement } : {})
    };

    let updatedPrismaRec: any = null;
    try {
      if (id && !id.startsWith('rec-')) {
        updatedPrismaRec = await prisma.livestockRecommendation.update({
          where: { id },
          data: {
            ...(breedName ? { breedName: breedName.trim() } : {}),
            ...(location ? { location: location.trim() } : {}),
            ...(expectedYield ? { expectedYield: expectedYield.trim() } : {}),
            ...(fatContent ? { fatContent: fatContent.trim() } : {}),
            ...(maintenanceLevel ? { maintenanceLevel } : {}),
            ...(imageUrl !== undefined ? { imageUrl } : {})
          }
        });
      } else {
        const existing = await prisma.livestockRecommendation.findFirst({
          where: {
            OR: [
              { breedName: { equals: breedName, mode: 'insensitive' } },
              ...(id ? [{ id }] : [])
            ]
          }
        });
        if (existing) {
          updatedPrismaRec = await prisma.livestockRecommendation.update({
            where: { id: existing.id },
            data: {
              ...(breedName ? { breedName: breedName.trim() } : {}),
              ...(location ? { location: location.trim() } : {}),
              ...(expectedYield ? { expectedYield: expectedYield.trim() } : {}),
              ...(fatContent ? { fatContent: fatContent.trim() } : {}),
              ...(maintenanceLevel ? { maintenanceLevel } : {}),
              ...(imageUrl !== undefined ? { imageUrl } : {})
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn('Prisma update recommendation failed, updating inMemoryStore:', dbErr);
    }

    const updatedMem = inMemoryStore.updateLivestockRecommendation(id || breedName, updateData);
    return NextResponse.json({ 
      success: true, 
      recommendation: updatedMem || updatedPrismaRec || { id, ...updateData } 
    }, { headers: NO_CACHE_HEADERS });
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
    if (!(await checkAdminAuth(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
      if (!id.startsWith('rec-')) {
        await prisma.livestockRecommendation.delete({ where: { id } });
      }
    } catch (dbErr) {
      console.warn('Prisma delete recommendation failed, deleting from inMemoryStore:', dbErr);
    }
    inMemoryStore.deleteLivestockRecommendation(id);
    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Failed to delete livestock recommendation:', error);
    return NextResponse.json({ error: 'Unable to delete.' }, { status: 500 });
  }
}
