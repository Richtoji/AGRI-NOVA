import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { inMemoryStore } from '@/lib/data/inMemoryStore';

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

    if (users && users.length > 0) {
      return NextResponse.json({ success: true, users });
    }
  } catch (error) {
    console.warn("DB fetching users failed, using inMemoryStore:", error);
  }

  const memoryUsers = inMemoryStore.getUsers().map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    kycStatus: u.kycStatus || 'VERIFIED',
    createdAt: u.createdAt || new Date().toISOString()
  }));

  return NextResponse.json({ success: true, users: memoryUsers });
}

export async function PATCH(request: Request) {
  try {
    const { id, kycStatus } = await request.json().catch(() => ({}));
    
    if (!id || !kycStatus) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { kycStatus }
      });
      return NextResponse.json({ success: true, user: updatedUser });
    } catch (dbErr) {
      console.warn("DB user update failed, using inMemoryStore:", dbErr);
    }

    const updated = inMemoryStore.updateUser(id, { kycStatus });
    return NextResponse.json({ success: true, user: updated || { id, kycStatus } });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}
