import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

async function getAdminRole() {
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await getAdminRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, title, description, category, price, unit, stockQuantity, imageUrl } = body;

    const dataToUpdate: any = {};
    if (status) {
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
      }
      dataToUpdate.status = status;
    }
    if (title) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (category) dataToUpdate.category = category;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (unit) dataToUpdate.unit = unit;
    if (stockQuantity !== undefined) dataToUpdate.stockQuantity = parseInt(stockQuantity, 10);
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
    const isAdmin = await getAdminRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
