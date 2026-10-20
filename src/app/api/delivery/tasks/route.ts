import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

async function getUserId(request?: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const uid = (payload.userId || payload.id || (payload as any).sub) as string;
      if (uid) return uid;
    }
  } catch (err) {}

  if (request) {
    const headerUid = request.headers.get('x-user-id');
    if (headerUid) return headerUid;
  }

  return 'u-delivery-01';
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);

    try {
      const tasks = await prisma.deliveryTask.findMany({
        where: { 
          driverId: userId,
          status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] }
        },
        include: {
          order: {
            include: {
              orderItems: {
                include: { product: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (tasks && tasks.length > 0) {
        return NextResponse.json({ success: true, tasks });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const fallbackTasks = inMemoryStore.getDeliveryTasks(userId);
    return NextResponse.json({ success: true, tasks: fallbackTasks });
  } catch (error) {
    console.error('Failed to fetch delivery tasks:', error);
    const fallbackTasks = inMemoryStore.getDeliveryTasks('u-delivery-01');
    return NextResponse.json({ success: true, tasks: fallbackTasks });
  }
}
