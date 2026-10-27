import { createHmac, timingSafeEqual } from "crypto";

export function verifyEsewaResponse(payload: Record<string, unknown>): boolean {
  const secretKey = process.env.ESEWA_SECRET_KEY;
  const signedFieldNames = payload.signed_field_names;
  const signature = payload.signature;

  if (
    !secretKey ||
    typeof signedFieldNames !== "string" ||
    typeof signature !== "string"
  ) {
    return false;
  }

  const fields = signedFieldNames.split(",");

  const requiredFields = [
    "transaction_code",
    "status",
    "total_amount",
    "transaction_uuid",
    "product_code",
    "signed_field_names",
  ];

  if (
    requiredFields.some((field) => !fields.includes(field)) ||
    fields.some(
      (field) =>
        !/^[a-z_]+$/.test(field) ||
        (typeof payload[field] !== "string" &&
          typeof payload[field] !== "number"),
    )
  ) {
    return false;
  }

  const message = fields.map((field) => `${field}=${payload[field]}`).join(",");

  const expectedSignature = createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
