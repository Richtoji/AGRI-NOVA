import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

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
    const { status, title, description, category, price, unit, stockQuantity, imageUrl, location } = body;

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

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 80) {
        return NextResponse.json({ error: 'Strict Validation Error: Title must be between 3 and 80 characters long.' }, { status: 400 });
      }
      if (!/[a-zA-Z]/.test(title)) {
        return NextResponse.json({ error: 'Strict Validation Error: Title must contain alphabetical letters.' }, { status: 400 });
      }
      dataToUpdate.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 1000) {
        return NextResponse.json({ error: 'Strict Validation Error: Description must be between 10 and 1000 characters.' }, { status: 400 });
      }
      dataToUpdate.description = description.trim();
    }

    if (category) dataToUpdate.category = category;
    if (location !== undefined) dataToUpdate.location = location;
    
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json({ error: 'Strict Validation Error: Price must be strictly greater than ₹0.00.' }, { status: 400 });
      }
      if (parsedPrice > 1000000) {
        return NextResponse.json({ error: 'Strict Validation Error: Price cannot exceed ₹1,000,000 per unit.' }, { status: 400 });
      }
      if (!/^\d+(\.\d{1,2})?$/.test(String(price).trim())) {
        return NextResponse.json({ error: 'Strict Validation Error: Price can have at most 2 decimal places.' }, { status: 400 });
      }
      dataToUpdate.price = parsedPrice;
    }
    
    if (unit) {
      const lowerUnit = unit.toLowerCase().trim();
      const validUnits = ["kg", "grams", "litres", "ml", "ton", "quintal", "dozen", "unit", "bunch", "packet"];
      if (!validUnits.includes(lowerUnit)) {
         return NextResponse.json({ error: `Strict Validation Error: Invalid unit. Must be one of ${validUnits.join(", ")}` }, { status: 400 });
      }
      dataToUpdate.unit = lowerUnit;
    }
    
    if (stockQuantity !== undefined) {
      const numStock = Number(stockQuantity);
      if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 1) {
        return NextResponse.json({ error: 'Strict Validation Error: Stock quantity must be a whole positive integer (min 1).' }, { status: 400 });
      }
      if (numStock > 100000) {
        return NextResponse.json({ error: 'Strict Validation Error: Stock quantity cannot exceed 100,000 units.' }, { status: 400 });
      }
      dataToUpdate.stockQuantity = numStock;
    }
    
    if (imageUrl) {
      if (typeof imageUrl !== 'string' || imageUrl.trim().length < 5) {
        return NextResponse.json({ error: 'Strict Validation Error: A valid product photograph is required.' }, { status: 400 });
      }
      dataToUpdate.imageUrl = imageUrl;
    }

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
