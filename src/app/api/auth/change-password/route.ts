import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth/serverAuth";
import { validateChangePassword } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { inMemoryStore } from "@/lib/data/inMemoryStore";

export async function POST(request: Request) {
  try {
    const { error, user } = await requireAuth();
    if (error || !user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body;

    // 1. Strict Server-Side Validation of Passwords
    const validation = validateChangePassword(
      currentPassword || "",
      newPassword || "",
      confirmPassword || ""
    );

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Verify Current Password
    let isCurrentValid = false;
    if (user.passwordHash && user.passwordHash.trim().length > 0) {
      isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    } else {
      // Default demo password only before user has customized their password
      isCurrentValid = currentPassword === "password123";
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "The current password you entered is incorrect." },
        { status: 400 }
      );
    }

    // 3. Generate Secure Salt & Hash
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 4. Update Database
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      });
    } catch (dbErr) {
      console.warn("DB password update unavailable, applying inMemoryStore update:", dbErr);
    }

    // 5. Update In-Memory Store
    inMemoryStore.updateUser(user.id, { passwordHash: newPasswordHash });

    return NextResponse.json({
      success: true,
      message: "Your password has been changed successfully. You can now use your new password."
    });
  } catch (err: any) {
    console.error("Change password route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while changing your password." },
      { status: 500 }
    );
  }
}
