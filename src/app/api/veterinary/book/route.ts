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
      return NextResponse.json({ error: 'Please log in to book an appointment.' }, { status: 401 });
    }

    const body = await request.json();
    const { date, time, symptoms, animal } = body;

    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required.' }, { status: 400 });
    }

    // Parse date and time
    // date: "YYYY-MM-DD"
    // time: "08:00 AM"
    const [timeStr, modifier] = time.split(' ');
    let [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;

    const scheduledAt = new Date(`${date}T${h.toString().padStart(2, '0')}:${minutes}:00`);

    // Strict validation: must be at least 24 hours in the future
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    if (scheduledAt < minDate) {
      return NextResponse.json({ error: 'Appointments must be booked at least 24 hours in advance.' }, { status: 400 });
    }

    // Find an available vet (a user with VETERINARY_EXPERT role)
    const vet = await prisma.user.findFirst({
      where: { role: 'VETERINARY_EXPERT' }
    });

    if (!vet) {
      return NextResponse.json({ error: 'No veterinary experts are currently available in the system.' }, { status: 503 });
    }

    // Check for overlaps: Vet cannot have another consultation within 1 hour before or after
    const oneHourBefore = new Date(scheduledAt.getTime() - 60 * 60 * 1000 + 1000); // add 1s to allow back-to-back
    const oneHourAfter = new Date(scheduledAt.getTime() + 60 * 60 * 1000 - 1000); // subtract 1s

    const existingConsultation = await prisma.vetConsultation.findFirst({
      where: {
        vetId: vet.id,
        scheduledAt: {
          gte: oneHourBefore,
          lte: oneHourAfter
        },
        status: {
          in: ['SCHEDULED']
        }
      }
    });

    if (existingConsultation) {
      return NextResponse.json({ error: 'This time slot is already booked for the veterinary expert.' }, { status: 409 });
    }

    // Create consultation
    const consultation = await prisma.vetConsultation.create({
      data: {
        vetId: vet.id,
        farmerId: userId,
        scheduledAt,
        notes: `Animal: ${animal}\nSymptoms: ${symptoms}`,
        status: 'SCHEDULED'
      }
    });

    return NextResponse.json({ success: true, consultation });

  } catch (error) {
    console.error('Failed to book appointment:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while booking.' }, { status: 500 });
  }
}
