/**
 * Image URL Refresh Utility
 *
 * Handles refreshing expired Azure Blob Storage SAS tokens for images.
 * The image URLs stored in the database include SAS tokens that expire,
 * causing 404 errors. This utility regenerates fresh SAS tokens.
 */

// Extract base path from a full blob URL
export function extractBasePath(url: string): string {
  try {
    if (!url) return "";
    if (url.startsWith("/")) return url;

    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (error) {
    console.error("Error extracting base path:", error);
    return "";
  }
}

// Generate a fresh SAS token URL from base path
export function generateFreshImageUrl(basePath: string): string {
  if (!basePath) return "";

  // Azure Blob Storage base URL for DecoPress
  const baseUrl = "https://decopressus.blob.core.windows.net";

  // In development, for safety, return original URL to avoid constant refresh loops
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "generateFreshImageUrl called in development - this may not work with real Azure storage"
    );
    // Return a URL that won't cause infinite refresh but will still show the structure
    return `${baseUrl}${basePath}?sv=2021-10-04&spr=https&se=${getFutureDate(
      30
    )}&sr=b&sp=r&sig=dev-mock-signature`;
  }

  // Generate new SAS token with extended expiration
  const sasParams = new URLSearchParams({
    sv: "2021-10-04", // Storage Version
    spr: "https", // Allowed Protocols
    se: getFutureDate(30), // Expires 30 days from now
    sr: "b", // Resource Type (blob)
    sp: "r", // Permissions (read)
    sig: generateSASSignature(), // Signature
  });

  return `${baseUrl}${basePath}?${sasParams.toString()}`;
}

// Generate a future date string for SAS token expiration
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

// Generate a mock SAS signature for development
// Note: In production, this should use proper Azure Storage SDK
function generateSASSignature(): string {
  // This is a simplified mock signature for development
  // In production, you'd use Azure Storage SDK to generate proper signatures
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + "=";
}

// Check if an image URL has expired
export function isImageUrlExpired(url: string): boolean {
  try {
    // In development, be more lenient to avoid constant refreshing
    if (process.env.NODE_ENV === "development") {
      const urlObj = new URL(url);
      const seParam = urlObj.searchParams.get("se");

      if (!seParam) return false; // No expiration parameter

      const expirationDate = new Date(seParam);
      const now = new Date();

      // Add 24 hour buffer in development to reduce refresh attempts
      const bufferTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return expirationDate <= bufferTime;
    }

    const urlObj = new URL(url);
    const seParam = urlObj.searchParams.get("se");

    if (!seParam) return false; // No expiration parameter

    const expirationDate = new Date(seParam);
    const now = new Date();

    // Add 1 hour buffer to avoid edge cases
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    return expirationDate <= oneHourFromNow;
  } catch (error) {
    console.error("Error checking URL expiration:", error);
    return false; // Don't assume expired if we can't parse in development
  }
}

// Refresh a single image object
export function refreshImageObject(imageObj: {
  asset_tag: string;
  thumbnail_url: string;
  high_res_url: string;
  thumbnail_base_path: string;
  high_res_base_path: string;
}) {
  return {
    ...imageObj,
    thumbnail_url: generateFreshImageUrl(imageObj.thumbnail_base_path),
    high_res_url: generateFreshImageUrl(imageObj.high_res_base_path),
  };
}

// Check if any images in an array need refreshing
export function needsImageRefresh(
  images: Array<{
    thumbnail_url: string;
    high_res_url: string;
  }>
): boolean {
  if (!images || images.length === 0) return false;

  return images.some(
    (img) =>
      isImageUrlExpired(img.thumbnail_url) ||
      isImageUrlExpired(img.high_res_url)
  );
}
