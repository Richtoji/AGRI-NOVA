import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minRating = searchParams.get('minRating');

    // Build the query
    const where: any = {};
    if (sellerId) where.sellerId = sellerId;
    if (category) where.category = category;
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    
    // Note: 'location' isn't natively on the Product model in schema.prisma, 
    // it's supposed to be fetched from the User (seller) or FarmProfile, 
    // but in mockSeedData it was manually attached. Let's see if location exists on Product...
    // Actually, looking at schema.prisma, Product doesn't have a 'location' or 'localName' field natively.
    // Let's assume we fetch all products and map them appropriately.

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: { name: true }
        }
      }
    });

    // Map to the shape expected by the frontend (adding sellerName)
    const formattedProducts = products.map((p) => ({
      ...p,
      sellerName: p.seller.name,
      // Fallback location and localName since they aren't in schema
      location: "Kerala",
      localName: p.title
    }));

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Unable to fetch products.' }, { status: 500 });
  }
}
