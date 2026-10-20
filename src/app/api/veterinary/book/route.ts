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

  return { userId: 'u-farmer-01', role: 'FARMER' };
}

export async function POST(request: Request) {
  try {
    const { userId, role } = await getUserInfo(request);

    // Admins are view-only and cannot book appointments
    if (role === 'ADMIN' || userId === 'u-admin-01') {
      return NextResponse.json(
        { error: 'Admins cannot book veterinary appointments. The admin role is restricted to audit and view-only permissions.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { date, time, symptoms, animal } = body;

    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required.' }, { status: 400 });
    }

    const [timeStr, modifier] = time.split(' ');
    let [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;

    const scheduledAt = new Date(`${date}T${h.toString().padStart(2, '0')}:${minutes}:00`);

    try {
      const vet = await prisma.user.findFirst({
        where: { role: 'VETERINARY_EXPERT' }
      });

      if (vet) {
        const consultation = await prisma.vetConsultation.create({
          data: {
            vetId: vet.id,
            farmerId: userId,
            scheduledAt,
            notes: `Animal: ${animal || "Farm Animal"}\nSymptoms: ${symptoms || "Health Check"}`,
            status: 'SCHEDULED'
          }
        });
        return NextResponse.json({ success: true, consultation });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const consultation = inMemoryStore.bookVetConsultation({
      farmerId: userId,
      scheduledAt: scheduledAt.toISOString(),
      notes: `Animal: ${animal || "Farm Animal"}\nSymptoms: ${symptoms || "General Health Consultation"}`
    });

    return NextResponse.json({ success: true, consultation });

  } catch (error) {
    console.error('Failed to book appointment:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while booking.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId, role } = await getUserInfo(request);
    const isAdmin = role === 'ADMIN' || userId === 'u-admin-01';

    try {
      const whereClause = isAdmin ? {} : {
        OR: [
          { vetId: userId },
          { farmerId: userId }
        ]
      };

      const appointments = await prisma.vetConsultation.findMany({
        where: whereClause,
        include: {
          farmer: { select: { name: true } },
          vet: { select: { name: true } }
        },
        orderBy: { scheduledAt: 'asc' }
      });

      if (appointments && appointments.length > 0) {
        const formattedAppointments = appointments.map((apt) => {
          const notes = apt.notes || "";
          const animalMatch = notes.match(/Animal:\s*(.*)/);
          const symptomsMatch = notes.match(/Symptoms:\s*(.*)/);
          const animal = animalMatch ? animalMatch[1] : "Unknown";
          const symptoms = symptomsMatch ? symptomsMatch[1] : notes;
          
          const dateObj = new Date(apt.scheduledAt);
          const formattedTime = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", " + 
                                dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

          return {
            id: apt.id,
            farmerName: apt.farmer?.name || "Farmer",
            vetName: apt.vet?.name || "Dr. Ananya Sharma",
            animal,
            symptoms,
            time: formattedTime,
            status: apt.status
          };
        });

        return NextResponse.json({ success: true, appointments: formattedAppointments });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const fallbackList = isAdmin
      ? inMemoryStore.getVetConsultations()
      : inMemoryStore.getVetConsultations(userId);

    const formatted = fallbackList.map((apt: any) => {
      const notes = apt.notes || "";
      const animalMatch = notes.match(/Animal:\s*(.*)/);
      const symptomsMatch = notes.match(/Symptoms:\s*(.*)/);
      const animal = animalMatch ? animalMatch[1] : "Dairy Cow";
      const symptoms = symptomsMatch ? symptomsMatch[1] : notes;
      
      const dateObj = new Date(apt.scheduledAt);
      const formattedTime = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", " + 
                            dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return {
        id: apt.id,
        farmerName: apt.farmer?.name || "Rajesh Kumar",
        vetName: apt.vet?.name || "Dr. Ananya Sharma, DVM",
        animal,
        symptoms,
        time: formattedTime,
        status: apt.status
      };
    });

    return NextResponse.json({ success: true, appointments: formatted });
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ success: true, appointments: [] });
  }
}
