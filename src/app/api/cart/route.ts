import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.upsert({
      where: { buyerId: userId },
      update: {},
      create: { buyerId: userId },
      include: {
        cartItems: {
          include: { product: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const formattedItems = cart.cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl,
      unit: item.product.unit,
      stockQuantity: item.product.stockQuantity
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Please log in to add products to your cart.' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();
    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product or quantity.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'This product is currently unavailable.' }, { status: 404 });
    }

    const cart = await prisma.cart.upsert({
      where: { buyerId: userId },
      update: {},
      create: { buyerId: userId }
    });

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    const newTotalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (newTotalQuantity > product.stockQuantity) {
      return NextResponse.json({ 
        error: `Only ${product.stockQuantity} ${product.unit} available.` 
      }, { status: 400 });
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newTotalQuantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return NextResponse.json({ error: 'Unable to add product to cart. Please try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({ where: { buyerId: userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
