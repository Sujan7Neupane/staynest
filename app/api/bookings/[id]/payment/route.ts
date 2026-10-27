import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import prisma from "@/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 },
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    if (booking.guestId !== session.user.id) {
      return NextResponse.json(
        { error: "You cannot pay for this booking." },
        { status: 403 },
      );
    }

    if (booking.status !== "PENDING" || booking.paymentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "This booking is not eligible for payment." },
        { status: 400 },
      );
    }

    const product_code = process.env.ESEWA_PRODUCT_CODE;
    const secretKey = process.env.ESEWA_SECRET_KEY;
    const appUrl = process.env.APP_URL;

    if (!product_code || !secretKey || !appUrl) {
      return NextResponse.json(
        { error: "eSewa payment configuration is missing." },
        { status: 500 },
      );
    }

    const transaction_uuid = `${Date.now()}-${booking.id}`;
    console.log(transaction_uuid);

    await prisma.booking.update({
      where: { id: booking.id },
      data: { transactionUuid: transaction_uuid },
    });

    const amount = Number(booking.totalPrice).toFixed(2);
    const tax_amount = "0";
    const product_service_charge = "0";
    const product_delivery_charge = "0";

    const total_amount = (
      Number(amount) +
      Number(tax_amount) +
      Number(product_service_charge) +
      Number(product_delivery_charge)
    ).toFixed(2);

    const signed_field_names = "total_amount,transaction_uuid,product_code";

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(
        `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`,
      )
      .digest("base64");

    const detail = {
      amount,
      tax_amount,
      total_amount,
      transaction_uuid,
      product_code,
      product_service_charge,
      product_delivery_charge,
      success_url: `${appUrl}/api/esewa/confirm`,
      failure_url: `${appUrl}/bookings/${booking.id}`,
      signed_field_names,
      signature,
    };
    // console.log(detail);

    return NextResponse.json(detail);
  } catch (error) {
    console.error("Get eSewa payment details error:", error);

    return NextResponse.json(
      { error: "Failed to get eSewa payment details." },
      { status: 500 },
    );
  }
}
