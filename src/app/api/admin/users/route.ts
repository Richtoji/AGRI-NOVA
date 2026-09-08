import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        kycStatus: true,
        createdAt: true,
      }
    });
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, kycStatus } = await request.json();
    
    if (!id || !kycStatus) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { kycStatus }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}
