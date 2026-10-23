import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/prisma";
import { inMemoryStore } from "@/lib/data/inMemoryStore";
import { validateFullName, validateEmailWithDetails, validatePhoneWithDetails } from "@/lib/validation";

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

export const dynamic = 'force-dynamic';

export async function GET() {
  const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0"
  };

  try {
    const { error, user } = await requireAuth();
    
    if (error || !user) {
      return NextResponse.json({
        success: false,
        user: null
      }, { 
        status: 200,
        headers: noCacheHeaders
      });
    }

    // Merge with latest in-memory state if available
    const memUser = inMemoryStore.getUserById(user.id) || inMemoryStore.getUserByEmail(user.email);
    const finalAvatar = memUser?.avatarUrl !== undefined ? memUser.avatarUrl : user.avatarUrl;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: memUser?.email || user.email,
        name: memUser?.name || user.name,
        role: user.role,
        phone: memUser?.phone !== undefined ? memUser.phone : user.phone,
        avatarUrl: finalAvatar || "",
        kycStatus: user.kycStatus || "VERIFIED",
      }
    }, {
      headers: noCacheHeaders
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      user: null
    }, { 
      status: 200,
      headers: noCacheHeaders
    });
  }
}

export async function PUT(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, phone } = body;
    const avatarInput = body.avatarUrl || body.avatarBase64 || body.avatar || body.imageUrl;

    // Strict profile input validation
    if (name) {
      const nameVal = validateFullName(name);
      if (!nameVal.isValid) {
        return NextResponse.json({ error: nameVal.error }, { status: 400 });
      }
    }

    if (email) {
      const emailVal = validateEmailWithDetails(email);
      if (!emailVal.isValid) {
        return NextResponse.json({ error: emailVal.error }, { status: 400 });
      }
    }

    let sanitizedPhone = phone;
    if (phone) {
      const phoneVal = validatePhoneWithDetails(phone);
      if (!phoneVal.isValid) {
        return NextResponse.json({ error: phoneVal.error }, { status: 400 });
      }
      sanitizedPhone = phoneVal.cleanPhone;
    }

    const memUser = inMemoryStore.getUserById(user.id) || inMemoryStore.getUserByEmail(user.email);
    const currentAvatar = memUser?.avatarUrl || user.avatarUrl;
    let avatarUrl = avatarInput !== undefined ? avatarInput : currentAvatar;

    const normalizedEmail = email ? email.trim().toLowerCase() : user.email;

    // Check duplicate email in in-memory store
    if (email) {
      const existingInMem = inMemoryStore.getUserByEmail(normalizedEmail);
      if (existingInMem && existingInMem.id !== user.id) {
        return NextResponse.json({ error: "Email already in use." }, { status: 400 });
      }
    }

    let updatedUserData = {
      id: user.id,
      email: normalizedEmail,
      name: name ? name.trim() : (memUser?.name || user.name),
      role: user.role,
      phone: sanitizedPhone !== undefined ? sanitizedPhone : (memUser?.phone || user.phone),
      avatarUrl: avatarInput !== undefined ? (avatarUrl || "") : (memUser?.avatarUrl || user.avatarUrl || ""),
      kycStatus: user.kycStatus || "VERIFIED"
    };

    try {
      const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingEmail && existingEmail.id !== user.id) {
        return NextResponse.json({ error: "Email already in use." }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: updatedUserData.name,
          email: updatedUserData.email,
          phone: updatedUserData.phone,
          ...(avatarInput !== undefined ? { avatarUrl: avatarUrl || "" } : {}),
        }
      });

      updatedUserData = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone || "",
        avatarUrl: updatedUser.avatarUrl !== undefined ? (updatedUser.avatarUrl || "") : (avatarUrl || ""),
        kycStatus: updatedUser.kycStatus || "VERIFIED"
      };
    } catch (dbErr) {
      console.warn("DB update skipped, updating inMemoryStore:", dbErr);
    }

    // Always keep inMemoryStore synchronized
    inMemoryStore.updateUserProfile(user.id, updatedUserData);

    // Refresh JWT session cookie with new email
    try {
      const token = jwt.sign(
        { userId: user.id, email: updatedUserData.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      const isHttps = request.headers.get("x-forwarded-proto") === "https" || request.url.startsWith("https://");
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    } catch (cookieErr) {
      console.warn("Could not refresh auth cookie:", cookieErr);
    }

    return NextResponse.json({
      success: true,
      user: updatedUserData
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
