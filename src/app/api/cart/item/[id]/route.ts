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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(request);
    const { id: cartItemId } = await context.params;
    const { quantity } = await request.json();

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity.' }, { status: 400 });
    }

    try {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { product: true, cart: true }
      });

      if (!cartItem) {
        throw new Error('Not in DB');
      }

      if (cartItem.cart.buyerId !== userId) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
      }

      if (quantity > cartItem.product.stockQuantity) {
        return NextResponse.json({ 
          error: `Only ${cartItem.product.stockQuantity} ${cartItem.product.unit} available.` 
        }, { status: 400 });
      }

      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      });

      return NextResponse.json({ success: true });
    } catch (dbErr) {
      // In-memory fallback
      const result = inMemoryStore.updateCartQuantity(userId, cartItemId, quantity);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to update quantity' }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quantity' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId(request);
    const { id: cartItemId } = await context.params;
    
    try {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true }
      });

      if (cartItem) {
        if (cartItem.cart.buyerId !== userId) {
          return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
        }

        await prisma.cartItem.delete({
          where: { id: cartItemId }
        });
        return NextResponse.json({ success: true });
      }
    } catch (dbErr) {}

    // In-memory fallback
    inMemoryStore.removeFromCart(userId, cartItemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
