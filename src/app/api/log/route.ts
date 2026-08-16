import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const logPath = path.join(process.cwd(), "client-error.log");
    fs.appendFileSync(logPath, JSON.stringify(data) + "\n");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
