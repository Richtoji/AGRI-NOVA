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
    const district = searchParams.get('district');

    try {
      const regions = await prisma.regionalLivestockAnalysis.findMany({
        where: district ? { district: { contains: district, mode: 'insensitive' as any } } : undefined,
        orderBy: { district: 'asc' }
      });
      if (regions && regions.length > 0) {
        return NextResponse.json({ success: true, regions });
      }
    } catch (dbErr) {
      console.warn('Prisma regional livestock fetch failed, falling back to inMemoryStore:', dbErr);
    }

    // Fallback to inMemoryStore
    const regions = district 
      ? inMemoryStore.getRegionalLivestock(district)
      : inMemoryStore.getRegionalLivestock();
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

    try {
      const newRegion = await prisma.regionalLivestockAnalysis.create({
        data: {
          district: data.district,
          primaryLivestock: data.primaryLivestock,
          focusAreas: data.focusAreas,
          imageUrl: data.imageUrl,
        }
      });
      inMemoryStore.addRegionalLivestock(newRegion);
      return NextResponse.json({ success: true, region: newRegion });
    } catch (dbErr: any) {
      console.warn('Prisma create failed, falling back to inMemoryStore:', dbErr);
      const newRegion = inMemoryStore.addRegionalLivestock(data);
      return NextResponse.json({ success: true, region: newRegion });
    }
  } catch (error: any) {
    console.error('Failed to create region:', error);
    return NextResponse.json({ error: 'Unable to add region.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
      const updatedRegion = await prisma.regionalLivestockAnalysis.update({
        where: { id },
        data: updateData
      });
      inMemoryStore.updateRegionalLivestock(id, updateData);
      return NextResponse.json({ success: true, region: updatedRegion });
    } catch (dbErr) {
      console.warn('Prisma update failed, updating inMemoryStore:', dbErr);
      const updated = inMemoryStore.updateRegionalLivestock(id, updateData);
      return NextResponse.json({ success: true, region: updated });
    }
  } catch (error) {
    console.error('Failed to update region:', error);
    return NextResponse.json({ error: 'Unable to update region.' }, { status: 500 });
  }
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
