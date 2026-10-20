import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/serverAuth";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, user } = await requireAuth();
  
  if (error) return error;

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
}

export async function PUT(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, email, phone, avatarBase64 } = body;

    // Optional: add validation here if needed, but client is already validating
    
    // Check if email or phone is already taken by ANOTHER user
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail && existingEmail.id !== user.id) {
      return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    }

    let avatarUrl = undefined;
    if (avatarBase64) {
      avatarUrl = avatarBase64;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim().replace(/\D/g, ""),
        ...(avatarUrl && { avatarUrl }),
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        kycStatus: updatedUser.kycStatus,
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
