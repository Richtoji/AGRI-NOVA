import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/serverAuth";

export async function GET() {
  const { error, user } = await requireAuth();
  
  if (error) return error;

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
}
