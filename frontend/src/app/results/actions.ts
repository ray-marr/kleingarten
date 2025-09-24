"use server";

import { v2 as cloudinary } from "cloudinary";
export type Ad = {
  title: string;
  description: string;
  thumbnail: string;
};

export type SearchRequest = {
  item?: string | string[];
  location?: string | string[];
  page?: number;
  pageSize?: number;
};

export type SearchResponse = {
  items: Ad[];
  total: number;
  page: number;
  pageSize: number;
};

// Mock data: 15 ads total
const ALL_ADS: Ad[] = Array.from({ length: 15 }).map((_, i) => ({
  title: `Apfel ${i + 1}`,
  description: "Ich habe eine menge Apfel zu verschenken",
  thumbnail: "todo",
}));

export async function searchAds(req: SearchRequest): Promise<SearchResponse> {
  // In a real scenario, you would query your database here using req.item/location
  const pageSize = typeof req.pageSize === "number" && req.pageSize > 0 ? req.pageSize : 10;
  const page = typeof req.page === "number" && req.page > 0 ? req.page : 1;

  // Optionally filter based on item/location; for now, return all
  const total = ALL_ADS.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = ALL_ADS.slice(start, end);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { items, total, page, pageSize };
}

// ==========================
// Cloudinary server actions
// ==========================

function ensureCloudinaryConfigured() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment."
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
}

/**
 * Upload an image to Cloudinary from a remote URL.
 * Returns Cloudinary upload response with selected fields.
 */
export async function uploadImageFromUrl(imageUrl: string, publicId?: string): Promise<{
  publicId: string;
  url: string;
  secureUrl: string;
  assetId?: string;
  version?: number;
}> {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("imageUrl is required and must be a string");
  }

  ensureCloudinaryConfigured();

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      assetId: result.asset_id,
      version: result.version,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Cloudinary upload failed: ${message}`);
  }
}

/**
 * Get a direct URL to download an image from Cloudinary by its publicId.
 * Optionally, apply basic optimization (auto format/quality).
 */

// TODO: test public image - 'samples/food/fish-vegetables'
export async function getImageDownloadUrl(publicId: string, options?: { optimize?: boolean }): Promise<string> {
  if (!publicId) {
    throw new Error("publicId is required");
  }

  ensureCloudinaryConfigured();

  const optimize = options?.optimize ?? true;
  const url = cloudinary.url(publicId, optimize ? { fetch_format: "auto", quality: "auto" } : {});
  return url;
}
