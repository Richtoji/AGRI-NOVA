import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inMemoryStore } from '@/lib/data/inMemoryStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const isActiveStr = searchParams.get('isActive');
    const isActive = isActiveStr !== null ? isActiveStr === 'true' : undefined;

    try {
      const where: any = {};
      if (category) where.category = category;
      if (isActive !== undefined) where.isActive = isActive;

      const schemes = await prisma.governmentScheme.findMany({
        where
      });

      if (schemes && schemes.length > 0) {
        return NextResponse.json({ success: true, schemes });
      }
    } catch (dbErr) {}

    // In-memory fallback
    const fallbackSchemes = inMemoryStore.getSchemes({ category, isActive });
    return NextResponse.json({ success: true, schemes: fallbackSchemes });
  } catch (error) {
    console.error('Failed to fetch schemes:', error);
    const fallbackSchemes = inMemoryStore.getSchemes();
    return NextResponse.json({ success: true, schemes: fallbackSchemes });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, department, category, description, subsidyAmount, linkUrl, isActive } = body;

    if (!title || !department || !category || !description || !subsidyAmount || !linkUrl) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    try {
      const newScheme = await prisma.governmentScheme.create({
        data: {
          title,
          department,
          category,
          description,
          subsidyAmount,
          linkUrl,
          isActive: isActive !== undefined ? isActive : true,
        }
      });

      return NextResponse.json({ success: true, scheme: newScheme });
    } catch (dbErr) {
      const newScheme = inMemoryStore.addScheme({
        title,
        department,
        category,
        description,
        subsidyAmount,
        linkUrl,
        isActive: isActive !== undefined ? isActive : true
      });
      return NextResponse.json({ success: true, scheme: newScheme });
    }
  } catch (error) {
    console.error('Failed to create scheme:', error);
    return NextResponse.json({ error: 'Unable to create scheme.' }, { status: 500 });
  }
}
