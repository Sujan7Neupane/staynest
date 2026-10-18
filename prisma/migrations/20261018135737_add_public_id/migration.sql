/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `PropertyImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `PropertyImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PropertyImage_publicId_key" ON "PropertyImage"("publicId");
