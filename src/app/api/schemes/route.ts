import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';

    const schemes = await prisma.governmentScheme.findMany({
      where
    });

    return NextResponse.json({ success: true, schemes });
  } catch (error) {
    console.error('Failed to fetch schemes:', error);
    return NextResponse.json({ error: 'Unable to fetch schemes.' }, { status: 500 });
  }
}
