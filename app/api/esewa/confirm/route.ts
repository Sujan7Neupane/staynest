import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/prisma/client";

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  try {
    const data = request.nextUrl.searchParams.get("data");

    if (!data) {
      return NextResponse.redirect(`${appUrl}/bookings`);
    }

    // Decode the response sent by eSewa.
    const payment = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    const {
      transaction_uuid,
      total_amount,
      product_code,
      signature,
      signed_field_names,
    } = payment;

    const secretKey = process.env.ESEWA_SECRET_KEY;
    const expectedProductCode = process.env.ESEWA_PRODUCT_CODE;

    if (!secretKey || !expectedProductCode) {
      throw new Error("eSewa configuration is missing.");
    }

    if (
      !transaction_uuid ||
      !signature ||
      !signed_field_names ||
      !total_amount ||
      !product_code
    ) {
      return NextResponse.redirect(`${appUrl}/bookings`);
    }

    // Verify the callback signature.
    const message = signed_field_names
      .split(",")
      .map((field: string) => `${field}=${payment[field]}`)
      .join(",");

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(message)
      .digest("base64");

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return NextResponse.redirect(`${appUrl}/bookings`);
    }

    // Find the booking using the saved transaction UUID.
    const booking = await prisma.booking.findUnique({
      where: { transactionUuid: transaction_uuid },
    });

    if (!booking) {
      return NextResponse.redirect(`${appUrl}/bookings`);
    }

    if (
      product_code !== expectedProductCode ||
      Number(total_amount) !== Number(booking.totalPrice)
    ) {
      return NextResponse.redirect(`${appUrl}/bookings/${booking.id}`);
    }

    const verificationUrl = new URL(
      "https://rc.esewa.com.np/api/epay/transaction/status/",
    );

    verificationUrl.searchParams.set("product_code", product_code);
    verificationUrl.searchParams.set("total_amount", String(total_amount));
    verificationUrl.searchParams.set("transaction_uuid", transaction_uuid);

    const verificationResponse = await fetch(verificationUrl);

    if (!verificationResponse.ok) {
      throw new Error("Could not verify the eSewa transaction.");
    }

    const verification = await verificationResponse.json();

    if (
      verification.status !== "COMPLETE" ||
      verification.product_code !== product_code ||
      verification.transaction_uuid !== transaction_uuid ||
      Number(verification.total_amount) !== Number(booking.totalPrice)
    ) {
      return NextResponse.redirect(`${appUrl}/bookings/${booking.id}`);
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paidAt: new Date(),
        paymentReference: verification.ref_id,
      },
    });

    return NextResponse.redirect(
      `${appUrl}/bookings/${booking.id}?payment=success`,
    );
  } catch (error) {
    console.error("eSewa confirmation error:", error);

    return NextResponse.redirect(`${appUrl}/bookings`);
  }
}
