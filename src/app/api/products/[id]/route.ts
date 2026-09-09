import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

async function getUserSession() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return { userId: payload.userId as string, role: payload.role as string };
  } catch (err) {
    return null;
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const isAdmin = session.role === 'ADMIN';

    const { id } = await params;
    
    // Find the product first to check ownership
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    
    const isSeller = existingProduct.sellerId === session.userId;
    if (!isAdmin && !isSeller) {
      return NextResponse.json({ error: 'Unauthorized. You do not have permission to edit this product.' }, { status: 403 });
    }

    const body = await request.json();
    const { status, title, description, category, price, unit, stockQuantity, imageUrl } = body;

    const dataToUpdate: any = {};
    if (isAdmin && status) {
      // Only admins can manually set status
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
      }
      dataToUpdate.status = status;
    } else if (isSeller && !isAdmin) {
      // Any edit by a regular seller forces the status back to PENDING
      dataToUpdate.status = 'PENDING';
    }

    if (title) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (category) dataToUpdate.category = category;
    
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: 'Strict Validation Error: Price must be a positive number.' }, { status: 400 });
      }
      dataToUpdate.price = parsedPrice;
    }
    
    if (unit) {
      const validUnits = ["kg", "grams", "litres", "ml", "ton", "quintal", "dozen", "unit"];
      if (!validUnits.includes(unit)) {
         return NextResponse.json({ error: 'Strict Validation Error: Invalid unit.' }, { status: 400 });
      }
      dataToUpdate.unit = unit;
    }
    
    if (stockQuantity !== undefined) {
      const parsedStock = parseInt(stockQuantity, 10);
      if (isNaN(parsedStock) || parsedStock <= 0) {
        return NextResponse.json({ error: 'Strict Validation Error: Stock quantity must be greater than zero.' }, { status: 400 });
      }
      dataToUpdate.stockQuantity = parsedStock;
    }
    
    if (imageUrl) dataToUpdate.imageUrl = imageUrl;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    
    const isAdmin = session.role === 'ADMIN';
    const { id } = await params;
    
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    
    const isSeller = existingProduct.sellerId === session.userId;
    if (!isAdmin && !isSeller) {
      return NextResponse.json({ error: 'Unauthorized. You do not have permission to delete this product.' }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
