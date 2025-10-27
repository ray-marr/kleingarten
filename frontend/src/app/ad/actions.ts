"use server";

import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import { db } from "@/db/client";
import { ads, images } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export type AdDetail = {
  id: number;
  slug: string;
  title: string;
  description: string;
  created: Date;
  images: string[]; // Cloudinary URLs, primary first
};

export async function getAdBySlug(slug: string): Promise<AdDetail | null> {
  const [ad] = await db
    .select({
      id: ads.id,
      slug: ads.slug,
      title: ads.title,
      description: ads.description,
      created: ads.creationTimeStamp,
    })
    .from(ads)
    .where(eq(ads.slug, slug));

  if (!ad) return null;

  // Ensure Cloudinary is configured for URL generation
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name) {
    cloudinary.config({ cloud_name, api_key, api_secret } as ConfigOptions);
  }

  // Fetch images for this ad with primary first then by id
  const rows = await db
    .select({
      publicId: images.url,
      primary: images.primaryImage,
      imgId: images.id,
    })
    .from(images)
    .where(eq(images.adsId, ad.id))
    // order: primary desc (true first), then id asc
    .orderBy(desc(images.primaryImage), asc(images.id));

  const imageUrls: string[] = [];
  for (const row of rows) {
    if (!row.publicId) continue;
    const url = cloudinary.url(row.publicId, {
      // Provide a reasonably large responsive image; client can size via CSS
      fetch_format: "jpg",
      quality: "auto",
      secure: true,
    });
    imageUrls.push(url);
  }

  return {
    id: ad.id,
    slug: ad.slug,
    title: ad.title,
    description: ad.description,
    created: ad.created,
    images: imageUrls,
  };
}
