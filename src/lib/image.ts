export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1600;

/**
 * Shrink a photo on the device before upload, to save the user's data.
 * The server re-encodes it again and strips metadata.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error(`"${file.name}" is larger than 5 MB.`);
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`"${file.name}" isn't a photo we can read. Try a JPEG or PNG.`);
  }
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
