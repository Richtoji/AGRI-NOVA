import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

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

export async function GET() {
  try {
    const regions = await prisma.regionalLivestockAnalysis.findMany({
      orderBy: { district: 'asc' }
    });
    return NextResponse.json({ regions });
  } catch (error) {
    console.error('Failed to fetch regional livestock analysis:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await request.json();
    const newRegion = await prisma.regionalLivestockAnalysis.create({
      data: {
        district: data.district,
        primaryLivestock: data.primaryLivestock,
        focusAreas: data.focusAreas,
        imageUrl: data.imageUrl,
      }
    });
    return NextResponse.json({ region: newRegion });
  } catch (error: any) {
    console.error('Failed to create region:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'District already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to add region.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const updatedRegion = await prisma.regionalLivestockAnalysis.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json({ region: updatedRegion });
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
    
    await prisma.regionalLivestockAnalysis.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete region:', error);
    return NextResponse.json({ error: 'Unable to delete.' }, { status: 500 });
  }
}
