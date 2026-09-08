import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import * as jose from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

async function checkAdminAuth() {
  if (!JWT_SECRET) return false;
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role === "ADMIN";
  } catch (err) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized upload access." }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = crypto.randomBytes(6).toString("hex");
    const originalExt = path.extname(file.name) || ".jpg";
    const filename = `${uniqueSuffix}${originalExt}`;
    
    // Path where it will be saved
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await import("fs/promises").then((fs) => fs.mkdir(uploadDir, { recursive: true }).catch(() => {}));
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/api/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
