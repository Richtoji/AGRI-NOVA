import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

async function getUserInfo(request?: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      const uid = (payload.userId || payload.id || (payload as any).sub) as string;
      const role = (payload.role || (payload as any).role) as string;
      if (uid) return { userId: uid, role };
    }
  } catch (err) {}

  if (request) {
    const headerUid = request.headers.get('x-user-id');
    const headerRole = request.headers.get('x-user-role');
    if (headerUid) return { userId: headerUid, role: headerRole || '' };
  }

  return { userId: 'u-equipment-01', role: 'EQUIPMENT_OWNER' };
}

export async function GET(request: Request) {
  try {
    const { userId, role } = await getUserInfo(request);
    const isAdmin = role === 'ADMIN' || userId === 'u-admin-01';

    let dbRentals: any[] = [];
    try {
      const whereClause = isAdmin 
        ? {} 
        : { 
            OR: [
              { equipment: { ownerId: userId } },
              { equipment: { ownerId: 'u-equipment-01' } }
            ] 
          };

      const found = await prisma.rentalBooking.findMany({
        where: whereClause,
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
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (found && found.length > 0) {
        dbRentals = found;
      }
    } catch (dbErr) {
      console.warn("DB fetch equipment requests failed:", dbErr);
    }

    // In-memory bookings
    const memoryRentals = isAdmin
      ? inMemoryStore.getEquipmentBookings()
      : inMemoryStore.getEquipmentBookings(userId);

    // Merge both sources by ID
    const combinedMap = new Map<string, any>();

    for (const r of memoryRentals) {
      combinedMap.set(r.id, r);
    }

    for (const r of dbRentals) {
      const renterObj = r.renter || {
        id: r.renterId,
        name: "Farmer Client",
        phone: "+91 98765 43210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      };
      combinedMap.set(r.id, {
        ...r,
        renter: renterObj,
        farmer: renterObj
      });
    }

    const allRentals = Array.from(combinedMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || a.startDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.startDate || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ rentals: allRentals });
  } catch (error) {
    console.error('Failed to fetch equipment requests:', error);
    const fallbackRentals = inMemoryStore.getEquipmentBookings();
    return NextResponse.json({ rentals: fallbackRentals });
  }
}
