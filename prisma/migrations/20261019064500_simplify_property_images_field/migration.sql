/*
  Warnings:

  - You are about to drop the `PropertyImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[imagePublicId]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PropertyImage" DROP CONSTRAINT "PropertyImage_propertyId_fkey";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- DropTable
DROP TABLE "PropertyImage";

-- CreateIndex
CREATE UNIQUE INDEX "Property_imagePublicId_key" ON "Property"("imagePublicId");
