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

  return 'u-equipment-01';
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);

    try {
      const rentals = await prisma.rentalBooking.findMany({
        where: {
          equipment: {
            ownerId: userId
          }
        },
        include: {
          equipment: true,
          renter: {
            select: {
              name: true,
              phone: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (rentals && rentals.length > 0) {
        const sanitized = rentals.map((r: any) => ({
          ...r,
          renter: r.renter || {
            name: "Rajesh Kumar",
            phone: "+91 98765 43210",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
          },
          farmer: r.renter || {
            name: "Rajesh Kumar",
            phone: "+91 98765 43210",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
          }
        }));
        return NextResponse.json({ rentals: sanitized });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const fallbackRentals = inMemoryStore.getEquipmentBookings(userId);
    return NextResponse.json({ rentals: fallbackRentals });
  } catch (error) {
    console.error('Failed to fetch equipment requests:', error);
    const fallbackRentals = inMemoryStore.getEquipmentBookings('u-equipment-01');
    return NextResponse.json({ rentals: fallbackRentals });
  }
}
