import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { getCurrentUser } from '@/lib/auth/session';

// Validate actual magic bytes — never trust file.type alone (client-controlled).
// SVG intentionally excluded: it can carry inline <script> tags.
function isSafeImageBuffer(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  const b = buf;
  const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const isPng  = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
              && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a;
  const isGif  = b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38;
  const isWebp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
              && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  return isJpeg || isPng || isGif || isWebp;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!isSafeImageBuffer(buffer)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'remnus/icons',
        transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'auto' }],
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Upload failed'));
        else resolve(result as { secure_url: string });
      }
    ).end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}
