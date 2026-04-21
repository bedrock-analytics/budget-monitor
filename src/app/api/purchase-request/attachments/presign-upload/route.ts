import { NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import {
  ALLOWED_CONTENT_TYPES,
  MAX_ATTACHMENT_SIZE,
  PR_ATTACHMENT_PREFIX,
  S3_BUCKET,
  s3,
  sanitizeFileName,
} from "@/lib/s3";

import { randomUUID } from "node:crypto";

const bodySchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1),
  fileSize: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    if (!S3_BUCKET) {
      return NextResponse.json({ error: "S3 bucket not configured" }, { status: 500 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { fileName, contentType, fileSize } = parsed.data;

    if (fileSize > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 400 });
    }

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const key = `${PR_ATTACHMENT_PREFIX}/${randomUUID()}-${sanitizeFileName(fileName)}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({ uploadUrl, fileKey: key });
  } catch (error) {
    console.error("Failed to presign upload:", error);
    return NextResponse.json({ error: "Failed to presign upload" }, { status: 500 });
  }
}
