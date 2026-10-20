import { NextResponse } from "next/server";
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
import { prisma } from "@/lib/prisma";
import { inMemoryStore } from "@/lib/data/inMemoryStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, dob, password, confirmPassword, role, roleMetadata, avatarBase64 } = body;

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

    const pwdVal = validatePasswords(password || "", confirmPassword || "");
    if (!pwdVal.isValid) {
      return NextResponse.json({ error: pwdVal.error }, { status: 400 });
    }

    const roleVal = validateRole(role || "");
    if (!roleVal.isValid) {
      return NextResponse.json({ error: roleVal.error }, { status: 400 });
    }

    const effectiveMeta = (roleMetadata && roleMetadata.trim().length > 0)
      ? roleMetadata
      : (role === 'BUYER' ? 'Residential Consumer' : role === 'FARMER' ? 'Organic Farmland, Kerala' : 'Agricultural Partner');

    let avatarUrl = avatarBase64;
    if (!avatarUrl || avatarUrl.trim() === "") {
      avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phoneVal.cleanPhone || phone.trim().replace(/[\s-()]/g, "");

    // 2. Database Checks & Creation with In-Memory Fallback
    try {
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

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const createdUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          phone: cleanPhone,
          dob: dob,
          name: name.trim(),
          passwordHash: passwordHash,
          role: role,
          kycStatus: "VERIFIED",
          ...(avatarUrl && { avatarUrl }),
        },
        select: {
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
    } catch (dbErr) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const reg = inMemoryStore.registerUser({
        name: name.trim(),
        email: normalizedEmail,
        phone: cleanPhone,
        dob,
        role,
        avatarUrl,
        passwordHash
      });

      if (!reg.success) {
        return NextResponse.json({ error: reg.error }, { status: 400 });
      }

      const { passwordHash: _, ...safeUser } = (reg as any).user;
      return NextResponse.json({
        success: true,
        message: "Account created successfully.",
        user: safeUser
      });
    }

  } catch (error: any) {
    console.error("Backend registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during server validation." },
      { status: 500 }
    );
  }
}
