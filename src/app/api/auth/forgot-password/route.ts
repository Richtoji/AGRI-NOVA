import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePasswords, validatePhoneWithDetails, validateDob } from "@/lib/validation";
import { inMemoryStore } from "@/lib/data/inMemoryStore";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, dob, newPassword, confirmPassword } = body;

    // Strict Phone Validation
    const phoneVal = validatePhoneWithDetails(phone || "");
    if (!phoneVal.isValid) {
      return NextResponse.json({ error: phoneVal.error }, { status: 400 });
    }
    const cleanPhone = phoneVal.cleanPhone || phone.trim().replace(/[\s-()]/g, "");

    // Strict DOB Validation
    const dobVal = validateDob(dob || "");
    if (!dobVal.isValid) {
      return NextResponse.json({ error: dobVal.error }, { status: 400 });
    }

    // Strict Passwords Validation
    const pwdVal = validatePasswords(newPassword || "", confirmPassword || "");
    if (!pwdVal.isValid) {
      return NextResponse.json({ error: pwdVal.error }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    try {
      // 1. Verify User Exists with Phone and DOB
      const user = await prisma.user.findUnique({
        where: { phone: cleanPhone }
      });

      if (user) {
        if (user.dob && user.dob !== dob) {
          return NextResponse.json(
            { error: "Identity verification failed. Incorrect Date of Birth." },
            { status: 401 }
          );
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash }
        });

        return NextResponse.json({
          success: true,
          message: "Password updated successfully."
        });
      }
    } catch (dbErr) {
      console.warn("DB forgot-password lookup failed, using inMemoryStore:", dbErr);
    }

    // In-memory fallback
    const memUser = inMemoryStore.getUserByPhone(cleanPhone);
    if (memUser) {
      inMemoryStore.updateUser(memUser.id, { passwordHash });
      return NextResponse.json({
        success: true,
        message: "Password updated successfully."
      });
    }

    return NextResponse.json(
      { error: "No account found with this phone number." },
      { status: 404 }
    );

  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
