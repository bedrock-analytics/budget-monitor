-- CreateTable
CREATE TABLE "PurchaseRequestAttachment" (
    "id" TEXT NOT NULL,
    "purchaseRequestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseRequestAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequestAttachment_fileKey_key" ON "PurchaseRequestAttachment"("fileKey");

-- CreateIndex
CREATE INDEX "PurchaseRequestAttachment_purchaseRequestId_idx" ON "PurchaseRequestAttachment"("purchaseRequestId");

-- AddForeignKey
ALTER TABLE "PurchaseRequestAttachment" ADD CONSTRAINT "PurchaseRequestAttachment_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
