import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

function isCustomImage(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith('data:image')) return true;
  if (u.startsWith('/api/uploads') || u.startsWith('/uploads')) return true;
  if (u.startsWith('http://') || u.startsWith('https://')) return true;
  if (u.startsWith('/') && !u.startsWith('/images/crops/')) return true;
  return false;
}

function pickBestImage(primary?: string, secondary?: string): string {
  if (isCustomImage(primary)) return primary!;
  if (isCustomImage(secondary)) return secondary!;
  return primary || secondary || '';
}

export async function GET(request: Request) {
  try {
    const memoryCrops = inMemoryStore.getCropProfiles();
    let dbCrops: any[] = [];
    try {
      dbCrops = await (prisma as any).cropProfile.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error: any) {
      console.warn("DB crop fetch failed, falling back to inMemoryStore:", error?.message);
    }

    // Merge DB crops with inMemoryStore, strictly preserving custom/uploaded images
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
  } catch (err: any) {
    return NextResponse.json(
      { success: true, crops: inMemoryStore.getCropProfiles() },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

