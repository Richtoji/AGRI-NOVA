import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const crops = await prisma.cropProfile.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ success: true, crops });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch crops' }, { status: 500 });
  }
}
