import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { validatePasswords } from "@/lib/validation";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, dob, newPassword, confirmPassword } = body;

    if (!phone || !dob || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/[\s-()]/g, "");

    // 1. Verify User Exists with Phone and DOB
    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone }
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number." },
        { status: 404 }
      );
    }

    if (user.dob !== dob) {
      return NextResponse.json(
        { error: "Identity verification failed. Incorrect Date of Birth." },
        { status: 401 }
      );
    }

    // 2. Validate New Password
    const pwdVal = validatePasswords(newPassword, confirmPassword);
    if (!pwdVal.isValid) {
      return NextResponse.json({ error: pwdVal.error }, { status: 400 });
    }

    // 3. Hash Password and Update User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully."
    });

  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
