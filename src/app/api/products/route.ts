import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

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

    // 1. Required fields presence check
    if (!title || !category || price === undefined || !unit || stockQuantity === undefined || !imageUrl) {
      return NextResponse.json({ error: 'Strict Validation Error: Missing required product fields.' }, { status: 400 });
    }

    // 2. Title validation (min 3, max 80, must contain letters)
    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 80) {
      return NextResponse.json({ error: 'Strict Validation Error: Title must be between 3 and 80 characters long.' }, { status: 400 });
    }
    if (!/[a-zA-Z]/.test(title)) {
      return NextResponse.json({ error: 'Strict Validation Error: Title must contain alphabetical letters.' }, { status: 400 });
    }

    // 3. Description validation (min 10, max 1000)
    if (typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 1000) {
      return NextResponse.json({ error: 'Strict Validation Error: Description must be between 10 and 1000 characters to ensure buyer transparency.' }, { status: 400 });
    }

    // 4. Price validation (> 0, <= 1,000,000, max 2 decimals)
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: 'Strict Validation Error: Price must be strictly greater than ₹0.00.' }, { status: 400 });
    }
    if (parsedPrice > 1000000) {
      return NextResponse.json({ error: 'Strict Validation Error: Price cannot exceed ₹1,000,000 per unit.' }, { status: 400 });
    }
    if (!/^\d+(\.\d{1,2})?$/.test(String(price).trim())) {
      return NextResponse.json({ error: 'Strict Validation Error: Price can have at most 2 decimal places.' }, { status: 400 });
    }

    // 5. Stock validation (integer >= 1, <= 100,000)
    const numStock = Number(stockQuantity);
    if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 1) {
      return NextResponse.json({ error: 'Strict Validation Error: Stock quantity must be a whole positive integer (min 1).' }, { status: 400 });
    }
    if (numStock > 100000) {
      return NextResponse.json({ error: 'Strict Validation Error: Stock quantity cannot exceed 100,000 units.' }, { status: 400 });
    }
    const parsedStock = numStock;

    // 6. Unit validation
    const validUnits = ["kg", "grams", "litres", "ml", "ton", "quintal", "dozen", "unit", "bunch", "packet"];
    const lowerUnit = unit.toLowerCase().trim();
    if (!validUnits.includes(lowerUnit)) {
      return NextResponse.json({ error: `Strict Validation Error: Invalid unit. Must be one of ${validUnits.join(", ")}` }, { status: 400 });
    }

    // 7. Image validation
    if (typeof imageUrl !== 'string' || imageUrl.trim().length < 5) {
      return NextResponse.json({ error: 'Strict Validation Error: A valid product photograph is required.' }, { status: 400 });
    }

    // 8. Rating validation
    let parsedRating = 5.0;
    if (rating !== undefined && rating !== null) {
      parsedRating = parseFloat(rating);
      if (isNaN(parsedRating) || parsedRating < 1.0 || parsedRating > 5.0) {
        return NextResponse.json({ error: 'Strict Validation Error: Quality rating must be between 1.0 and 5.0.' }, { status: 400 });
      }
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
