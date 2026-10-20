import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

async function getUserId() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.userId as string;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }

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

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to fetch buyer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.buyerId !== userId) {
      return NextResponse.json({ error: 'Order not found or unauthorized.' }, { status: 404 });
    }

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
  } catch (error) {
    console.error('Failed to update buyer order:', error);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}
