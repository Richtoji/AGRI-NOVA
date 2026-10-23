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
  if (u === '/images/crops/arecanut.jpg' || u === '/images/crops/coconut.jpg') return true;
  return false;
}

export function pickBestImage(primary?: string, secondary?: string): string {
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

    const mergedMap = new Map<string, any>();

    // In-memory store holds live session updates from Admin edits
    for (const m of memoryCrops) {
      const key = (m.name || '').toLowerCase().trim();
      if (key) mergedMap.set(key, { ...m });
      if (m.id) mergedMap.set((m.id || '').toLowerCase().trim(), { ...m });
    }

    // Overlay DB crops: if in-memory has a custom image, keep it! If DB has an update or crop not in memory, merge it!
    for (const d of dbCrops) {
      const key = (d.name || '').toLowerCase().trim();
      const idKey = (d.id || '').toLowerCase().trim();
      const existing = mergedMap.get(key) || mergedMap.get(idKey);
      
      if (!existing) {
        mergedMap.set(key || idKey, { ...d });
      } else {
        const memImg = existing.imageUrl;
        const dbImg = d.imageUrl;
        const finalImg = isCustomImage(memImg) ? memImg : (isCustomImage(dbImg) ? dbImg : (memImg || dbImg));
        mergedMap.set(key, {
          ...d,
          ...existing,
          imageUrl: finalImg
        });
      }
    }

    const finalList = Array.from(new Set(mergedMap.values()));
    return NextResponse.json({ success: true, crops: finalList }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json(
      { success: true, crops: inMemoryStore.getCropProfiles() },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

