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
    const district = searchParams.get('district');

    let dbRegions: any[] = [];
    try {
      dbRegions = await prisma.regionalLivestockAnalysis.findMany({
        where: district ? { district: { contains: district, mode: 'insensitive' as any } } : undefined,
        orderBy: { district: 'asc' }
      });
    } catch (dbErr) {
      console.warn('Prisma regional livestock fetch failed:', dbErr);
    }

    const memRegions = district 
      ? inMemoryStore.getRegionalLivestock(district)
      : inMemoryStore.getRegionalLivestock();

    // Merge: In-memory store has live updates; merge dbRegions if not in memRegions
    const mergedMap = new Map<string, any>();
    for (const m of memRegions) {
      mergedMap.set(m.district.toLowerCase(), m);
      if (m.id) mergedMap.set(m.id, m);
    }
    for (const d of dbRegions) {
      const key = (d.district || '').toLowerCase();
      if (!mergedMap.has(key) && !mergedMap.has(d.id)) {
        mergedMap.set(key || d.id, d);
      }
    }
    const regions = Array.from(new Set(mergedMap.values()));
    return NextResponse.json({ success: true, regions });
  } catch (error) {
    console.error('Failed to fetch regional livestock analysis:', error);
    const regions = inMemoryStore.getRegionalLivestock();
    return NextResponse.json({ success: true, regions });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await request.json();

    let newRegion: any = null;
    try {
      newRegion = await prisma.regionalLivestockAnalysis.create({
        data: {
          district: data.district,
          primaryLivestock: data.primaryLivestock,
          focusAreas: data.focusAreas,
          imageUrl: data.imageUrl,
        }
      });
    } catch (dbErr: any) {
      console.warn('Prisma create failed, falling back to inMemoryStore:', dbErr);
    }

    const memRegion = inMemoryStore.addRegionalLivestock({
      id: newRegion?.id,
      ...data
    });

    return NextResponse.json({ success: true, region: memRegion || newRegion });
  } catch (error: any) {
    console.error('Failed to create region:', error);
    return NextResponse.json({ error: 'Unable to add region.' }, { status: 500 });
  }
}

async function handleUpdate(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await request.json();
    const { id, district, ...updateData } = data;
    
    if (!id && !district) return NextResponse.json({ error: 'ID or District required' }, { status: 400 });

    const fullPayload: any = {
      ...(district ? { district } : {}),
      ...updateData
    };

    let updatedPrismaRegion: any = null;
    try {
      if (id) {
        updatedPrismaRegion = await prisma.regionalLivestockAnalysis.update({
          where: { id },
          data: fullPayload
        });
      } else if (district) {
        updatedPrismaRegion = await prisma.regionalLivestockAnalysis.update({
          where: { district },
          data: updateData
        });
      }
    } catch (dbErr) {
      console.warn('Prisma update failed, updating inMemoryStore:', dbErr);
    }

    const updatedMem = inMemoryStore.updateRegionalLivestock(id || district, fullPayload);
    return NextResponse.json({ 
      success: true, 
      region: updatedMem || updatedPrismaRegion || { id, district, ...updateData } 
    });
  } catch (error) {
    console.error('Failed to update region:', error);
    return NextResponse.json({ error: 'Unable to update region.' }, { status: 500 });
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
      await prisma.regionalLivestockAnalysis.delete({ where: { id } });
    } catch (dbErr) {
      console.warn('Prisma delete failed, deleting from inMemoryStore:', dbErr);
    }
    inMemoryStore.deleteRegionalLivestock(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete region:', error);
    return NextResponse.json({ error: 'Unable to delete.' }, { status: 500 });
  }
}
