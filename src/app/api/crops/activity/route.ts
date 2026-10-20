import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '';

async function getUser() {
  if (!JWT_SECRET) return null;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    return {
      ...payload,
      id: userId,
      userId: userId,
      role: payload.role as string,
      email: payload.email as string
    };
  } catch (err) {
    return null;
  }
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user || user.role !== 'FARMER') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const body = await request.json();
    const { activityId, status } = body;
    
    if (!activityId || !status) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const activity = await (prisma as any).cultivationActivity.findUnique({
      where: { id: activityId },
      include: { cultivation: true }
    });

    if (!activity || activity.cultivation.farmerId !== user.id) {
       return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const updated = await (prisma as any).cultivationActivity.update({
      where: { id: activityId },
      data: { status }
    });

    return NextResponse.json({ success: true, activity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}
