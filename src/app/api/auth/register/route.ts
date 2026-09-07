import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  validateFullName,
  validateEmailWithDetails,
  validatePhoneWithDetails,
  validatePasswords,
  validateRole,
  validateRoleMetadata,
  validateDob
} from "@/lib/validation";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, dob, password, confirmPassword, role, roleMetadata } = body;

    // 1. Strict Server-Side Validation for Every Single Field
    const nameVal = validateFullName(name || "");
    if (!nameVal.isValid) {
      return NextResponse.json({ error: nameVal.error }, { status: 400 });
    }

    const emailVal = validateEmailWithDetails(email || "");
    if (!emailVal.isValid) {
      return NextResponse.json({ error: emailVal.error }, { status: 400 });
    }

    const phoneVal = validatePhoneWithDetails(phone || "");
    if (!phoneVal.isValid) {
      return NextResponse.json({ error: phoneVal.error }, { status: 400 });
    }

    const dobVal = validateDob(dob || "");
    if (!dobVal.isValid) {
      return NextResponse.json({ error: dobVal.error }, { status: 400 });
    }

    // Explicitly validate confirmPassword matches password
    const pwdVal = validatePasswords(password || "", confirmPassword || "");
    if (!pwdVal.isValid) {
      return NextResponse.json({ error: pwdVal.error }, { status: 400 });
    }

    const roleVal = validateRole(role || "");
    if (!roleVal.isValid) {
      return NextResponse.json({ error: roleVal.error }, { status: 400 });
    }

    const metaVal = validateRoleMetadata(role || "", roleMetadata || "");
    if (!metaVal.isValid) {
      return NextResponse.json({ error: metaVal.error }, { status: 400 });
    }

    // Normalize values
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[\s-()]/g, "");

    // 2. Database Checks & Constraints
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone }
    });
    if (existingUserByPhone) {
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
        { status: 400 }
      );
    }

    // 3. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create User
    const createdUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        phone: cleanPhone,
        dob: dob,
        name: name.trim(),
        passwordHash: passwordHash,
        role: role,
        kycStatus: "PENDING"
      },
      select: { // Do not return passwordHash
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        dob: true,
        avatarUrl: true,
        kycStatus: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: createdUser
    });

  } catch (error: any) {
    console.error("Backend registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during server validation." },
      { status: 500 }
    );
  }
}
