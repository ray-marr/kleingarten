"use server";

import { v2 as cloudinary } from "cloudinary";
import { db } from "@/db/client";
import { ads, images } from "@/db/schema";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";

export type Ad = {
  id: number;
  title: string;
  description: string;
  thumbnail?: string; // Cloudinary URL if available
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

export async function searchAds(req: SearchRequest): Promise<SearchResponse> {
  const pageSize = typeof req.pageSize === "number" && req.pageSize > 0 ? req.pageSize : 10;
  const page = typeof req.page === "number" && req.page > 0 ? req.page : 1;
  const offset = (page - 1) * pageSize;

  // Build simple text filter for title/description from `item`
  const itemValue = Array.isArray(req.item) ? req.item[0] : req.item;
  const q = itemValue?.trim();

  // Where clause (currently only item filter; location reserved for future)
  const where = q ? or(ilike(ads.title, `%${q}%`), ilike(ads.description, `%${q}%`)) : undefined;

  // Total count
  const totalRes = await db.execute(sql`SELECT count(*)::int AS c FROM ${ads} ${where ? sql`WHERE ${where}` : sql``}`);
  const total = Array.isArray(totalRes.rows) && totalRes.rows[0] ? (totalRes.rows[0] as any).c as number : 0;

  // Page of ads
  const adRows = await db.select({ id: ads.id, title: ads.title, description: ads.description })
    .from(ads)
    .where(where as any)
    .orderBy(sql`${ads.id} DESC`)
    .limit(pageSize)
    .offset(offset);

  if (adRows.length === 0) {
    return { items: [], total, page, pageSize };
  }

  // Fetch first image (by earliest images.id) per ad
  const adIds = adRows.map((r) => r.id);
  const imageRows = await db
    .select({ adsId: images.adsId, publicId: images.url }) // we store public_id in url field (<=50)
    .from(images)
    .where(inArray(images.adsId, adIds))
    .orderBy(images.adsId, images.id);

  const firstImageByAd = new Map<number, string>();
  for (const row of imageRows) {
    if (row.adsId != null && !firstImageByAd.has(row.adsId)) {
      firstImageByAd.set(row.adsId, row.publicId ?? "");
    }
  }

  // Ensure Cloudinary is configured for URL generation
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name) {
    // For URL generation, cloud_name is sufficient; include keys if available
    cloudinary.config({ cloud_name, api_key, api_secret } as any);
  }

  const items: Ad[] = adRows.map((r) => {
    const publicId = firstImageByAd.get(r.id);
    let thumbnail: string | undefined = undefined;
    if (publicId) {
      // Generate a small, cropped thumbnail URL
      thumbnail = cloudinary.url(publicId, {
        width: 96,
        height: 96,
        crop: "fill",
        gravity: "auto",
        fetch_format: "auto",
        quality: "auto",
        secure: true,
      });
    }
    return { id: r.id, title: r.title, description: r.description, thumbnail };
  });

  return { items, total, page, pageSize };
}
