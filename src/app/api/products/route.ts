import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

async function getUserSession() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return { userId: payload.userId as string, role: payload.role as string };
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minRating = searchParams.get('minRating');
    const status = searchParams.get('status');

    // Build the query
    const where: any = {};
    if (sellerId) where.sellerId = sellerId;
    if (category) where.category = category;
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (location) where.location = location;
    
    // Status logic: 
    // - Admin fetching specific status (e.g. PENDING) -> use that status
    // - Seller fetching their own products -> show all (no status filter unless specified)
    // - Public marketplace -> only show APPROVED
    if (status) {
      if (status !== 'ALL') where.status = status;
    } else if (!sellerId) {
      where.status = 'APPROVED';
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProducts = products.map((p) => ({
      ...p,
      sellerName: p.seller.name,
      location: p.location || "Kerala",
      localName: p.title
    }));

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Unable to fetch products.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Please log in to sell a product.' }, { status: 401 });
    }
    const sellerId = session.userId;
    const isAdmin = session.role === 'ADMIN';

    const body = await request.json();
    const { title, description, category, price, unit, stockQuantity, imageUrl, location, quality, rating } = body;

    if (!title || !category || price === undefined || !unit || stockQuantity === undefined || !imageUrl) {
      return NextResponse.json({ error: 'Missing required product fields.' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stockQuantity, 10);
    const validUnits = ["kg", "grams", "litres", "ml", "ton", "quintal", "dozen", "unit"];

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Strict Validation Error: Price must be a positive number.' }, { status: 400 });
    }
    if (isNaN(parsedStock) || parsedStock <= 0) {
      return NextResponse.json({ error: 'Strict Validation Error: Stock quantity must be greater than zero.' }, { status: 400 });
    }
    const lowerUnit = unit.toLowerCase();
    if (!validUnits.includes(lowerUnit)) {
      return NextResponse.json({ error: `Strict Validation Error: Invalid unit. Must be one of ${validUnits.join(", ")}` }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        sellerId,
        title,
        description: description || "",
        category,
        price: parsedPrice,
        unit: lowerUnit,
        stockQuantity: parsedStock,
        imageUrl,
        location,
        quality: quality || null,
        rating: rating ? parseFloat(rating) : 5.0,
        status: isAdmin ? 'APPROVED' : 'PENDING'
      }
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Unable to submit product for approval.' }, { status: 500 });
  }
}
