import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/prisma";
import { inMemoryStore } from "@/lib/data/inMemoryStore";

export async function GET() {
  try {
    const { error, user } = await requireAuth();
    
    if (error || !user) {
      return NextResponse.json({
        success: false,
        user: null
      }, { status: 200 });
    }

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
  } catch (err) {
    return NextResponse.json({
      success: false,
      user: null
    }, { status: 200 });
  }
}

export async function PUT(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, email, phone, avatarBase64 } = body;

    let avatarUrl = avatarBase64 || user.avatarUrl;

    try {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail && existingEmail.id !== user.id) {
        return NextResponse.json({ error: "Email already in use." }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name ? name.trim() : user.name,
          email: email ? email.trim().toLowerCase() : user.email,
          phone: phone ? phone.trim().replace(/\D/g, "") : user.phone,
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
    } catch (dbErr) {
      // In-memory fallback
      const updated = inMemoryStore.updateUserProfile(user.id, {
        name: name ? name.trim() : user.name,
        email: email ? email.trim().toLowerCase() : user.email,
        phone: phone ? phone.trim().replace(/\D/g, "") : user.phone,
        ...(avatarUrl && { avatarUrl })
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: email || user.email,
          name: name || user.name,
          role: user.role,
          phone: phone || user.phone,
          avatarUrl: avatarUrl || user.avatarUrl,
          kycStatus: user.kycStatus || "VERIFIED",
        }
      });
    }
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
