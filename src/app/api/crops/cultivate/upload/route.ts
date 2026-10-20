import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import * as jose from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "";

async function getAuthenticatedUser() {
  if (!JWT_SECRET) return null;
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.userId || payload.id || (payload as any).sub) as string;
    return {
      ...payload,
      id: userId,
      userId: userId,
      role: payload.role as string,
      email: payload.email as string
    };
  } catch {
    return null;
  }
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // 1. File exists
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please upload a crop photograph before submitting." }, { status: 400 });
    }

    // 2. File size validation (Max 5 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image size exceeds the maximum allowed limit of 5 MB." }, { status: 400 });
    }

    // 3. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: "Please upload a JPG, JPEG, PNG, or WEBP image." }, { status: 400 });
    }

    // 4. File extension validation
    const originalExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(originalExt)) {
      return NextResponse.json({ error: "Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed." }, { status: 400 });
    }

    // 5. Buffer & Magic Bytes header validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length < 12) {
      return NextResponse.json({ error: "The selected file could not be read as a valid image." }, { status: 400 });
    }

    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp =
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json({ 
        error: "Invalid image file. Please upload a valid crop photograph." 
      }, { status: 400 });
    }

    // 6. Safe cryptographic filename generation
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const sanitizedExt = isPng ? ".png" : isWebp ? ".webp" : ".jpg";
    const safeFilename = `cultivation_${uniqueSuffix}_${Date.now()}${sanitizedExt}`;

    // 7. Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true }).catch(() => {});

    const filePath = path.join(uploadDir, safeFilename);
    await writeFile(filePath, buffer);

    const fileUrl = `/api/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: safeFilename,
      originalName: file.name,
      size: file.size,
      mimeType: file.type
    });
  } catch (error) {
    console.error("Cultivation image upload error:", error);
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  }
}
