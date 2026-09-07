import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function isAdmin() {
  if (!JWT_SECRET) return false;
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
    const crops = await prisma.cropProfile.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ crops });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch crops' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const crop = await prisma.cropProfile.create({ data: body });
    return NextResponse.json({ crop });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create crop' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const { id, ...data } = body;
    const crop = await prisma.cropProfile.update({ where: { id }, data });
    return NextResponse.json({ crop });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.cropProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete crop' }, { status: 500 });
  }
}
