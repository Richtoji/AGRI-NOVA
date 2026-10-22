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
      const key = (m.district || '').toLowerCase().trim();
      if (key) mergedMap.set(key, m);
      if (m.id) mergedMap.set(m.id.toLowerCase().trim(), m);
    }
    for (const d of dbRegions) {
      const key = (d.district || '').toLowerCase().trim();
      const idKey = (d.id || '').toLowerCase().trim();
      if (!mergedMap.has(key) && !mergedMap.has(idKey)) {
        mergedMap.set(key || idKey, d);
      }
    }
    const regions = Array.from(new Set(mergedMap.values()));
    return NextResponse.json({ success: true, regions }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Failed to fetch regional livestock analysis:', error);
    const regions = inMemoryStore.getRegionalLivestock();
    return NextResponse.json({ success: true, regions }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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

    return NextResponse.json({ success: true, region: memRegion || newRegion }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error('Failed to create region:', error);
    return NextResponse.json({ error: 'Unable to add region.' }, { status: 500 });
  }
}

async function handleUpdate(request: Request) {
  try {
    if (!(await checkAdminAuth(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await request.json();
    const { id, district, ...updateData } = data;
    
    if (!id && !district) return NextResponse.json({ error: 'ID or District required' }, { status: 400 });

    const fullPayload: any = {
      ...(district ? { district: district.trim() } : {}),
      ...updateData
    };

    let updatedPrismaRegion: any = null;
    try {
      if (id && !id.startsWith('reg-')) {
        updatedPrismaRegion = await prisma.regionalLivestockAnalysis.update({
          where: { id },
          data: {
            ...(district ? { district: district.trim() } : {}),
            ...(updateData.primaryLivestock ? { primaryLivestock: updateData.primaryLivestock } : {}),
            ...(updateData.focusAreas ? { focusAreas: updateData.focusAreas } : {}),
            ...(updateData.imageUrl !== undefined ? { imageUrl: updateData.imageUrl } : {})
          }
        });
      } else if (district) {
        const existing = await prisma.regionalLivestockAnalysis.findFirst({
          where: { district: { equals: district.trim(), mode: 'insensitive' } }
        });
        if (existing) {
          updatedPrismaRegion = await prisma.regionalLivestockAnalysis.update({
            where: { id: existing.id },
            data: {
              ...(updateData.primaryLivestock ? { primaryLivestock: updateData.primaryLivestock } : {}),
              ...(updateData.focusAreas ? { focusAreas: updateData.focusAreas } : {}),
              ...(updateData.imageUrl !== undefined ? { imageUrl: updateData.imageUrl } : {})
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn('Prisma update failed, updating inMemoryStore:', dbErr);
    }

    const updatedMem = inMemoryStore.updateRegionalLivestock(id || district, fullPayload);
    return NextResponse.json({ 
      success: true, 
      region: updatedMem || updatedPrismaRegion || { id, district, ...updateData } 
    }, { headers: NO_CACHE_HEADERS });
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
    if (!(await checkAdminAuth(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    try {
      if (!id.startsWith('reg-')) {
        await prisma.regionalLivestockAnalysis.delete({ where: { id } });
      }
    } catch (dbErr) {
      console.warn('Prisma delete failed, deleting from inMemoryStore:', dbErr);
    }
    inMemoryStore.deleteRegionalLivestock(id);
    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Failed to delete region:', error);
    return NextResponse.json({ error: 'Unable to delete.' }, { status: 500 });
  }
}
