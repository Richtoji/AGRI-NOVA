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

  return 'u-buyer-01';
}

export async function GET(request: Request) {
  const userId = await getUserId(request);

  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                unit: true,
                category: true,
                price: true,
                location: true,
              }
            }
          }
        },
        deliveries: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (orders && orders.length > 0) {
      return NextResponse.json({ success: true, orders });
    }
    
    // In-memory fallback
    const fallbackOrders = inMemoryStore.getBuyerOrders(userId);
    return NextResponse.json({ success: true, orders: fallbackOrders });
  } catch (error) {
    const fallbackOrders = inMemoryStore.getBuyerOrders(userId);
    return NextResponse.json({ success: true, orders: fallbackOrders });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId(request);
    const body = await request.json().catch(() => ({}));
    const { orderId, action } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (order && order.buyerId === userId) {
        let updatedStatus = order.status;
        if (action === 'CONFIRM_INSPECTION') {
          updatedStatus = 'DELIVERED';
        } else if (action === 'CANCEL') {
          if (order.status === 'DELIVERED') {
            return NextResponse.json({ error: 'Cannot cancel an already delivered order.' }, { status: 400 });
          }
          updatedStatus = 'CANCELLED';
        }

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status: updatedStatus }
        });

        return NextResponse.json({ success: true, order: updated });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const result = inMemoryStore.updateOrderStatus(orderId, userId, action);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update order.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    console.error('Failed to update buyer order:', error);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}
