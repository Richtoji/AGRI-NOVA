import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import * as jose from "jose";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";

const JWT_SECRET = (process.env.JWT_SECRET || "super_secure_production_ready_secret_12345").trim();

const ALLOWED_UPLOAD_ROLES = ["ADMIN", "SUPER_ADMIN", "AGRICULTURAL_EXPERT", "VETERINARY_EXPERT", "EQUIPMENT_OWNER", "FARMER", "BUYER", "DELIVERY_PARTNER"];

async function checkAdminAuth(request?: Request): Promise<boolean> {
  try {
    const roleHeader = request?.headers?.get("x-user-role");
    if (roleHeader && ALLOWED_UPLOAD_ROLES.includes(roleHeader)) {
      return true;
    }

    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      if (roleHeader && ALLOWED_UPLOAD_ROLES.includes(roleHeader)) return true;
      return false;
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && (ALLOWED_UPLOAD_ROLES.includes(decoded.role) || decoded.userId)) {
        return true;
      }
    } catch {
      // Ignore
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload && ALLOWED_UPLOAD_ROLES.includes(payload.role as string)) {
        return true;
      }
    } catch {
      // Ignore
    }

    // If role header is authorized
    if (roleHeader && ALLOWED_UPLOAD_ROLES.includes(roleHeader)) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized upload access." }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Strict Validation Error: Only image files are allowed." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Strict Validation Error: Image size must be less than 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = crypto.randomBytes(6).toString("hex");
    const originalExt = path.extname(file.name) || ".jpg";
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const lowerExt = originalExt.toLowerCase();
    if (!allowedExtensions.includes(lowerExt)) {
      return NextResponse.json({ error: "Strict Validation Error: Invalid image extension." }, { status: 400 });
    }

    const filename = `${uniqueSuffix}${lowerExt}`;
    
    // Path where it will be saved
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await import("fs/promises").then((fs) => fs.mkdir(uploadDir, { recursive: true }).catch(() => {}));
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const staticUrl = `/uploads/${filename}`;
    const apiUrl = `/api/uploads/${filename}`;
    return NextResponse.json({ success: true, url: staticUrl, staticUrl, apiUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
