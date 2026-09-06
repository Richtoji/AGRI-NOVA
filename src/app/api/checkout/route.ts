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

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Please log in to checkout.' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { buyerId: userId },
      include: {
        cartItems: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.cartItems.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    // Validation pass: Ensure stock is sufficient for all items
    for (const item of cart.cartItems) {
      if (item.quantity > item.product.stockQuantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${item.product.title}. Only ${item.product.stockQuantity} ${item.product.unit} available.` 
        }, { status: 400 });
      }
    }

    // Execute Order creation, Stock reduction, and Cart clearing in a transaction
    await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = cart.cartItems.map(item => {
        const itemTotal = item.quantity * item.product.price;
        totalAmount += itemTotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price
        };
      });

      // Add a standard delivery fee (e.g. 50 as used in UI)
      totalAmount += 50;

      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          totalAmount: totalAmount,
          deliveryAddress: "Buyer Default Address", // In a real app this would come from request
          orderItems: {
            create: orderItemsData
          }
        }
      });

      // 2. Reduce Stock
      for (const item of cart.cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // 3. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    });

    return NextResponse.json({ success: true, message: 'Order placed successfully!' });
  } catch (error) {
    console.error('Checkout failed:', error);
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 });
  }
}
