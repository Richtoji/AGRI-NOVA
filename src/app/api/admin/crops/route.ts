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

export function isCustomImage(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith('data:image')) return true;
  if (u.startsWith('/api/uploads') || u.startsWith('/uploads')) return true;
  if (u.startsWith('http://') || u.startsWith('https://')) return true;
  if (u.startsWith('/') && !u.startsWith('/images/crops/')) return true;
  return false;
}

export function pickBestImage(primary?: string, secondary?: string): string {
  if (isCustomImage(primary)) return primary!;
  if (isCustomImage(secondary)) return secondary!;
  return primary || secondary || '';
}

async function checkAdminAuth(request?: Request): Promise<boolean> {
  try {
    // 1. Check request header fallback (immediate priority for admin UI calls)
    const roleHeader = request?.headers?.get('x-user-role');
    if (roleHeader && ['ADMIN', 'SUPER_ADMIN', 'AGRICULTURAL_EXPERT', 'VETERINARY_EXPERT'].includes(roleHeader)) {
      return true;
    }

    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return false;

    // Try jsonwebtoken verification
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && ['ADMIN', 'SUPER_ADMIN', 'AGRICULTURAL_EXPERT', 'VETERINARY_EXPERT'].includes(decoded.role)) {
        return true;
      }
    } catch {
      // Ignore
    }

    // Try jose verification
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload && ['ADMIN', 'SUPER_ADMIN', 'AGRICULTURAL_EXPERT', 'VETERINARY_EXPERT'].includes(payload.role as string)) {
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
    const memoryCrops = inMemoryStore.getCropProfiles();
    let dbCrops: any[] = [];
    try {
      dbCrops = await prisma.cropProfile.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (dbErr) {
      console.warn("DB admin crops fetch failed, relying on inMemoryStore:", dbErr);
    }

    // Merge DB crops with in-memory store, strictly preserving custom/uploaded images
    const cropsMap = new Map<string, any>();
    
    // First populate from inMemoryStore
    if (Array.isArray(memoryCrops)) {
      memoryCrops.forEach(c => {
        const key = (c.name || '').toLowerCase().trim();
        cropsMap.set(key, { ...c });
      });
    }

    // Then layer DB crops, preserving any custom image
    if (Array.isArray(dbCrops)) {
      dbCrops.forEach(c => {
        const key = (c.name || '').toLowerCase().trim();
        const existing = cropsMap.get(key);
        if (existing) {
          const bestImg = pickBestImage(existing.imageUrl, c.imageUrl);
          cropsMap.set(key, { ...existing, ...c, imageUrl: bestImg });
        } else {
          cropsMap.set(key, { ...c });
        }
      });
    }

    const mergedList = Array.from(cropsMap.values()).map(c => {
      const memMatch = memoryCrops?.find((m: any) => (m.name || '').toLowerCase().trim() === (c.name || '').toLowerCase().trim());
      const bestImg = pickBestImage(c.imageUrl, memMatch?.imageUrl);
      return { ...c, imageUrl: bestImg || c.imageUrl };
    });

    const finalList = mergedList.length > 0 ? mergedList : memoryCrops;

    return NextResponse.json({ success: true, crops: finalList }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("GET admin crops failed:", error?.message);
    return NextResponse.json({ success: true, crops: inMemoryStore.getCropProfiles() }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();

    // 1. Sync to inMemoryStore
    const memoryCrop = inMemoryStore.addCropProfile(body);

    // 2. Try to sync to Prisma
    let dbCrop = null;
    try {
      dbCrop = await (prisma as any).cropProfile.create({
        data: {
          name: body.name,
          category: body.category || "General Crop",
          expectedYield: body.expectedYield || "Standard Yield",
          growingPeriod: body.growingPeriod || "Seasonal",
          waterRequirement: parseFloat(body.waterRequirement) || 3.0,
          fertilizer: body.fertilizer || "Organic Compost",
          pesticide: body.pesticide || "Organic Biopesticides",
          imageUrl: body.imageUrl || `/images/crops/${(body.name || 'crop').toLowerCase().replace(/\s+/g, '-')}.jpg`
        }
      });
    } catch (dbErr) {
      console.warn("Prisma create crop failed, saved to inMemoryStore only:", dbErr);
    }

    return NextResponse.json({ success: true, crop: dbCrop || memoryCrop }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("POST admin crop failed:", error?.message);
    return NextResponse.json({ error: 'Failed to create crop' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleUpdate(request);
}

export async function PATCH(request: Request) {
  return handleUpdate(request);
}

async function handleUpdate(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    const { id, ...data } = body;

    const cropName = data.name || body.name;

    // 1. Always update inMemoryStore first (guaranteed instant consistency)
    const updatedMemoryCrop = inMemoryStore.updateCropProfile(id || cropName, {
      ...data,
      name: cropName
    });

    // 2. Try to update or upsert in Prisma
    let dbCrop = null;
    try {
      // Find existing crop in DB by id or case-insensitive name
      let existing = null;
      if (id) {
        try {
          existing = await (prisma as any).cropProfile.findUnique({ where: { id } });
        } catch {
          existing = null;
        }
      }
      if (!existing && cropName) {
        existing = await (prisma as any).cropProfile.findFirst({
          where: {
            OR: [
              { name: { equals: cropName, mode: 'insensitive' } },
              { name: cropName }
            ]
          }
        });
      }

      const updatePayload: any = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.category !== undefined) updatePayload.category = data.category;
      if (data.expectedYield !== undefined) updatePayload.expectedYield = data.expectedYield;
      if (data.growingPeriod !== undefined) updatePayload.growingPeriod = data.growingPeriod;
      if (data.waterRequirement !== undefined) updatePayload.waterRequirement = parseFloat(data.waterRequirement) || 3.0;
      if (data.fertilizer !== undefined) updatePayload.fertilizer = data.fertilizer;
      if (data.pesticide !== undefined) updatePayload.pesticide = data.pesticide;
      if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;

      if (existing) {
        dbCrop = await (prisma as any).cropProfile.update({
          where: { id: existing.id },
          data: updatePayload
        });
      } else if (cropName) {
        // Upsert by creating if not existing in DB
        dbCrop = await (prisma as any).cropProfile.create({
          data: {
            name: cropName,
            category: data.category || "General Crop",
            expectedYield: data.expectedYield || "Standard Yield",
            growingPeriod: data.growingPeriod || "Seasonal",
            waterRequirement: parseFloat(data.waterRequirement) || 3.0,
            fertilizer: data.fertilizer || "Organic Compost",
            pesticide: data.pesticide || "Organic Biopesticides",
            imageUrl: data.imageUrl || `/images/crops/${cropName.toLowerCase().replace(/\s+/g, '-')}.jpg`
          }
        });
      }
    } catch (dbErr) {
      console.warn("Prisma update crop failed, updated inMemoryStore only:", dbErr);
    }

    const effectiveCrop = {
      ...(updatedMemoryCrop || {}),
      ...(dbCrop || {}),
      imageUrl: pickBestImage(data.imageUrl, dbCrop?.imageUrl || updatedMemoryCrop?.imageUrl)
    };

    return NextResponse.json({ success: true, crop: effectiveCrop }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Update admin crop failed:", error?.message);
    return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // 1. Delete from inMemoryStore
    inMemoryStore.deleteCropProfile(id);

    // 2. Try delete from Prisma
    try {
      let existing = null;
      try {
        existing = await prisma.cropProfile.findUnique({ where: { id } });
      } catch {
        existing = null;
      }
      if (!existing) {
        existing = await prisma.cropProfile.findFirst({
          where: {
            OR: [
              { name: { equals: id, mode: 'insensitive' } },
              { name: id }
            ]
          }
        });
      }
      if (existing) {
        await prisma.cropProfile.delete({ where: { id: existing.id } });
      }
    } catch (dbErr) {
      console.warn("Prisma delete crop failed:", dbErr);
    }

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("DELETE admin crop failed:", error?.message);
    return NextResponse.json({ error: 'Failed to delete crop' }, { status: 500 });
  }
}

