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

    // Merge DB crops with inMemoryStore (inMemoryStore live edits take precedence)
    const cropsMap = new Map<string, any>();

    if (Array.isArray(dbCrops)) {
      dbCrops.forEach(c => {
        cropsMap.set((c.name || '').toLowerCase(), { ...c });
      });
    }

    if (Array.isArray(memoryCrops)) {
      memoryCrops.forEach(c => {
        const key = (c.name || '').toLowerCase();
        const existing = cropsMap.get(key) || {};
        cropsMap.set(key, { ...existing, ...c });
      });
    }

    const mergedList = Array.from(cropsMap.values());
    const finalList = mergedList.length > 0 ? mergedList : memoryCrops;

    return NextResponse.json({ success: true, crops: finalList }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { success: true, crops: inMemoryStore.getCropProfiles() },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

