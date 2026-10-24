/*
  Warnings:

  - A unique constraint covering the columns `[transactionUuid]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentReference]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "transactionUuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_transactionUuid_key" ON "Booking"("transactionUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_paymentReference_key" ON "Booking"("paymentReference");
