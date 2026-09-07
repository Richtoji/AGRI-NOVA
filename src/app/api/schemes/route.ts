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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, department, category, description, subsidyAmount, linkUrl, isActive } = body;

    if (!title || !department || !category || !description || !subsidyAmount || !linkUrl) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

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
  } catch (error) {
    console.error('Failed to create scheme:', error);
    return NextResponse.json({ error: 'Unable to create scheme.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Scheme ID is required.' }, { status: 400 });
    }

    await prisma.governmentScheme.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete scheme:', error);
    return NextResponse.json({ error: 'Unable to delete scheme.' }, { status: 500 });
  }
}
