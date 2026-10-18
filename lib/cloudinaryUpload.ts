import "server-only";
import cloudinary from "./cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_SIZE_MB = 5;

const cloudinaryUpload = async (file: File) => {
  if (!file || file.size === 0) {
    throw new Error("Please select an image");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (
    !ALLOWED_TYPES.includes(file.type) ||
    !ALLOWED_EXTENSIONS.includes(extension ?? "")
  ) {
    throw new Error("Only JPG, PNG, and WebP images are allowed");
  }

  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB > MAX_SIZE_MB) {
    throw new Error("Image size must not exceed 5 MB");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      resource_type: "image",
      folder: "staynest/properties",
    });

    return uploadResponse;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

export default cloudinaryUpload;
