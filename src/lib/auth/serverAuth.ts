import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

export async function requireAuth(allowedRoles?: RoleType[]) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }), user: null };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: RoleType };
    
    // Check role before even hitting the DB to save a query if they are unauthorized
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return { error: NextResponse.json({ error: "Access Forbidden" }, { status: 403 }), user: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return { error: NextResponse.json({ error: "User not found" }, { status: 404 }), user: null };
    }
    
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return { error: NextResponse.json({ error: "Access Forbidden" }, { status: 403 }), user: null };
    }

    return { error: null, user };
  } catch (error) {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }), user: null };
  }
}
