import { NextResponse } from "next/server";

import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { db } from "@/lib/db";
import { S3_BUCKET, s3 } from "@/lib/s3";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const attachment = await db.purchaseRequestAttachment.findUnique({ where: { id } });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: attachment.fileKey,
      ResponseContentDisposition: `attachment; filename="${attachment.fileName}"`,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("Failed to presign download:", error);
    return NextResponse.json({ error: "Failed to presign download" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const attachment = await db.purchaseRequestAttachment.findUnique({ where: { id } });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: attachment.fileKey }));
    await db.purchaseRequestAttachment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete attachment:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}
