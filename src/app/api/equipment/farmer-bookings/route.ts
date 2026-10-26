import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

export const dynamic = 'force-dynamic';

async function getUserInfo(request?: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const uid = (payload.userId || payload.id || (payload as any).sub) as string;
      const role = (payload.role || (payload as any).role) as string;
      const email = (payload.email || (payload as any).email) as string;
      if (uid) return { userId: uid, role, email };
    }
  } catch (err) {}

  if (request) {
    const headerUid = request.headers.get('x-user-id');
    const headerRole = request.headers.get('x-user-role');
    const headerEmail = request.headers.get('x-user-email');
    if (headerUid) return { userId: headerUid, role: headerRole || '', email: headerEmail || '' };
  }

  return { userId: 'u-farmer-01', role: 'FARMER', email: 'farmer@agri-nova.com' };
}

export async function GET(request: Request) {
  try {
    const { userId, role, email } = await getUserInfo(request);

    // 1. Fetch from Prisma database
    let dbRentals: any[] = [];
    try {
      const isSeedFarmer = userId === 'u-farmer-01' || email === 'farmer@agri-nova.com';
      const whereCondition = isSeedFarmer
        ? { OR: [{ renterId: userId }, { renterId: 'u-farmer-01' }] }
        : { renterId: userId };

      const found = await prisma.rentalBooking.findMany({
        where: whereCondition,
        include: {
          equipment: true,
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      if (found && found.length > 0) {
        dbRentals = found;
      }
    } catch (dbErr) {
      console.warn("DB fetch farmer equipment bookings failed, falling back to inMemoryStore:", dbErr);
    }

    // 2. Fetch from In-Memory Store
    const allMemoryRentals = inMemoryStore.getEquipmentBookings();
    const isSeedFarmer = userId === 'u-farmer-01' || email === 'farmer@agri-nova.com';

    const memoryFarmerRentals = allMemoryRentals.filter((b: any) => {
      if (isSeedFarmer) {
        return b.farmerId === userId || b.farmerId === 'u-farmer-01' || b.renter?.id === userId || b.renter?.id === 'u-farmer-01';
      }
      return b.farmerId === userId || b.renter?.id === userId;
    });

    // 3. Merge and deduplicate by ID
    const combinedMap = new Map<string, any>();

    for (const r of memoryFarmerRentals) {
      combinedMap.set(r.id, r);
    }

    for (const r of dbRentals) {
      const existing = combinedMap.get(r.id);
      combinedMap.set(r.id, {
        ...(existing || {}),
        ...r,
        equipment: r.equipment || existing?.equipment,
        renter: r.renter || existing?.renter
      });
    }

    const sortedBookings = Array.from(combinedMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || a.startDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.startDate || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      bookings: sortedBookings,
      count: sortedBookings.length
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache"
      }
    });

  } catch (err: any) {
    console.error("Farmer equipment bookings error:", err);
    return NextResponse.json({
      success: false,
      error: "Failed to retrieve equipment orders."
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await getUserInfo(request);
    const body = await request.json().catch(() => ({}));
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    // Try updating DB
    try {
      await prisma.rentalBooking.updateMany({
        where: { id: bookingId, renterId: userId, status: 'PENDING' },
        data: { status: 'CANCELLED' }
      });
    } catch (_) {}

    // Update in-memory store
    inMemoryStore.updateEquipmentBookingStatus(bookingId, 'CANCELLED');

    return NextResponse.json({
      success: true,
      message: "Equipment booking request cancelled successfully."
    });
  } catch (err: any) {
    console.error("Failed to cancel equipment booking:", err);
    return NextResponse.json({ error: "Failed to cancel booking request." }, { status: 500 });
  }
}
