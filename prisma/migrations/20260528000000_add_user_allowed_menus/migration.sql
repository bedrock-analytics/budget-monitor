-- AlterTable
ALTER TABLE "User" ADD COLUMN "allowedMenus" TEXT[] DEFAULT ARRAY[]::TEXT[];
