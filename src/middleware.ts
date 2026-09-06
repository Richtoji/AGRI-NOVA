import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect top-level feature routes
  const protectedPaths = ["/dashboard", "/marketplace", "/equipment", "/schemes", "/veterinary"];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      // Role-based routing validation for Dashboards
      if (pathname.startsWith("/dashboard/farmer") && role !== "FARMER") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      if (pathname.startsWith("/dashboard/buyer") && role !== "BUYER") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      if (pathname.startsWith("/dashboard/equipment") && role !== "EQUIPMENT_OWNER") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      if (pathname.startsWith("/dashboard/veterinary") && role !== "VETERINARY_EXPERT") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      if (pathname.startsWith("/dashboard/delivery") && role !== "DELIVERY_PARTNER") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Role-based routing for Top-Level App Routes
      if (pathname.startsWith("/marketplace") && !["FARMER", "BUYER", "ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      if (pathname.startsWith("/equipment") && !["FARMER", "EQUIPMENT_OWNER", "ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      if (pathname.startsWith("/veterinary") && !["FARMER", "VETERINARY_EXPERT", "ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  // Prevent logged-in users from accessing login/register pages
  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;
        let redirectPath = "/dashboard/farmer";
        if (role === "BUYER") redirectPath = "/dashboard/buyer";
        if (role === "EQUIPMENT_OWNER") redirectPath = "/dashboard/equipment";
        if (role === "VETERINARY_EXPERT") redirectPath = "/dashboard/veterinary";
        if (role === "DELIVERY_PARTNER") redirectPath = "/dashboard/delivery";
        if (role === "ADMIN") redirectPath = "/dashboard/admin";
        
        return NextResponse.redirect(new URL(redirectPath, request.url));
      } catch (e) {
        // Token is invalid, let them access the auth pages
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/marketplace/:path*",
    "/equipment/:path*",
    "/schemes/:path*",
    "/veterinary/:path*"
  ],
};
