import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/serverAuth";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const prisma = new PrismaClient();

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
      try {
        const matches = avatarBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const buffer = Buffer.from(matches[2], "base64");
          const uniqueSuffix = crypto.randomBytes(6).toString("hex");
          const filename = `avatar_${uniqueSuffix}.jpg`;
          const filePath = path.join(process.cwd(), "public/uploads", filename);
          await writeFile(filePath, buffer);
          avatarUrl = `/uploads/${filename}`;
        }
      } catch (err) {
        console.error("Failed to parse and save avatar image", err);
      }
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
