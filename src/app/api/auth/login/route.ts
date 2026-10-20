import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { inMemoryStore } from "@/lib/data/inMemoryStore";
import { validateEmailWithDetails } from "@/lib/validation";

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = body.email || body.identifier;
    const { password, role } = body;

    const emailVal = validateEmailWithDetails(rawEmail || "");
    if (!emailVal.isValid) {
      return NextResponse.json(
        { error: emailVal.error },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.trim().length === 0) {
      return NextResponse.json(
        { error: "Password is required and cannot be empty or whitespace." },
        { status: 400 }
      );
    }

    const normalizedEmail = rawEmail.trim().toLowerCase();

    // 1. Find user in DB or inMemoryStore
    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    } catch (dbErr) {
      console.warn("Database connection unavailable, falling back to inMemoryStore:", dbErr);
    }

    if (!user) {
      user = inMemoryStore.getUserByEmail(normalizedEmail);
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 2. Role Check (if role specified)
    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `Account exists, but is not registered as a ${role}.` },
        { status: 403 }
      );
    }

    // 3. Verify Password
    let isValidPassword = false;
    if (user.passwordHash && user.passwordHash.trim().length > 0) {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Default initial password before user sets custom password
      isValidPassword = password === "password123";
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 4. Create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Set HttpOnly Cookie
    const isHttps = request.headers.get("x-forwarded-proto") === "https" || request.url.startsWith("https://");
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // 6. Return user profile without hash
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        kycStatus: user.kycStatus,
      }
    });

  } catch (error: any) {
    console.error("Backend login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
