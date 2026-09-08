import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    // ensure no directory traversal
    if (filename.includes('/') || filename.includes('..')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }
    
    // Read from public/uploads relative to the project root
    const filePath = path.join(process.cwd(), 'public/uploads', filename);
    const fileBuffer = await readFile(filePath);
    
    // determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new NextResponse('File not found', { status: 404 });
  }
}
