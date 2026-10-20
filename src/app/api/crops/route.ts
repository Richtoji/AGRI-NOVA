import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export async function GET(request: Request) {
  try {
    const crops = await prisma.cropProfile.findMany({
      orderBy: { name: 'asc' }
    });
    if (crops && crops.length > 0) {
      return NextResponse.json({ success: true, crops });
    }
  } catch (error: any) {
    console.warn("DB crop fetch failed, falling back to inMemoryStore:", error?.message);
  }
  return NextResponse.json({ success: true, crops: inMemoryStore.getCropProfiles() });
}
