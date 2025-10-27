"use server";

import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import { db } from "@/db/client";
import { ads, images } from "@/db/schema";
import { ilike, inArray, or, sql, and, eq, SQL } from "drizzle-orm";

export type Ad = {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string; // Cloudinary URL if available
  imageCount: number; // total images for this ad
  created: Date; // iso datetime string
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

// Generate german character variants to make searches like "ae" match "ä" and vice versa.
function generateGermanVariants(q: string): string[] {
  const variants = new Set<string>();
  variants.add(q);

  // Map ASCII digraphs to umlauts/ß
  const asciiToUmlaut: Array<[RegExp, string]> = [
    [/ae/g, "ä"],
    [/oe/g, "ö"],
    [/ue/g, "ü"],
    [/ss/g, "ß"],
    [/AE/g, "Ä"],
    [/OE/g, "Ö"],
    [/UE/g, "Ü"],
  ];
  // Map umlauts/ß to ASCII digraphs
  const umlautToAscii: Array<[RegExp, string]> = [
    [/ä/g, "ae"],
    [/ö/g, "oe"],
    [/ü/g, "ue"],
    [/ß/g, "ss"],
    [/Ä/g, "AE"],
    [/Ö/g, "OE"],
    [/Ü/g, "UE"],
  ];

  let asciiVariant = q;
  for (const [re, rep] of umlautToAscii)
    asciiVariant = asciiVariant.replace(re, rep);
  variants.add(asciiVariant);

  let umlautVariant = q;
  for (const [re, rep] of asciiToUmlaut)
    umlautVariant = umlautVariant.replace(re, rep);
  variants.add(umlautVariant);

  return Array.from(variants).filter((v) => v.trim().length > 0);
}

export async function searchAds(req: SearchRequest): Promise<SearchResponse> {
  const pageSize =
    typeof req.pageSize === "number" && req.pageSize > 0 ? req.pageSize : 10;
  const page = typeof req.page === "number" && req.page > 0 ? req.page : 1;
  const offset = (page - 1) * pageSize;

  // Build a simple text filter for title/description from `item`
  const itemValue = Array.isArray(req.item) ? req.item[0] : req.item;
  const qRaw = itemValue?.trim();

  // Precompute variants for german characters
  const variants = qRaw ? generateGermanVariants(qRaw) : [];

  // Default where/order using ILIKE as fallback
  let whereClause: SQL<unknown> | undefined = qRaw
    ? or(ilike(ads.title, `%${qRaw}%`), ilike(ads.description, `%${qRaw}%`))
    : undefined;
  let orderByClause: SQL<string> = sql`${ads.id} DESC`;

  // Try to use pg_trgm similarity if available
  if (qRaw) {
    try {
      // Build OR conditions for trigram similarity across variants
      const conditions = variants.map(
        (v) =>
          sql`similarity(${ads.title}, ${v}) >= 0 OR similarity(${ads.description}, ${v}) >= 0 OR ${ads.title} ILIKE ${"%" + v + "%"} OR ${ads.description} ILIKE ${"%" + v + "%"}`,
      );
      const combined = conditions.reduce(
        (acc, cur, idx) => (idx === 0 ? sql`${cur}` : sql`${acc} OR (${cur})`),
        sql`` as SQL<unknown>,
      );

      whereClause = combined as SQL<unknown>;

      // Order by best similarity score first, then id desc
      const scoreExpr = variants.reduce(
        (acc, v, idx) =>
          idx === 0
            ? sql`GREATEST(similarity(${ads.title}, ${v}), similarity(${ads.description}, ${v}))`
            : sql`GREATEST(${acc}, GREATEST(similarity(${ads.title}, ${v}), similarity(${ads.description}, ${v})))`,
        sql`` as SQL<unknown>,
      );
      orderByClause = sql`${scoreExpr} DESC, ${ads.creationTimeStamp} DESC`;
    } catch (e) {
      console.error("Error using pg_trgm similarity:", e);
      // pg_trgm not available; fallback to ILIKE
      whereClause = qRaw
        ? or(
            ...variants
              .map((v) => [
                ilike(ads.title, `%${v}%`),
                ilike(ads.description, `%${v}%`),
              ])
              .flat(),
          )
        : undefined;
      orderByClause = sql`${ads.id} DESC`;
    }
  }

  // Total count
  const totalRes = await db.execute(
    sql`SELECT count(*)::int AS c FROM ${ads} ${whereClause ? sql`WHERE ${whereClause}` : sql``}`,
  );
  const total =
    Array.isArray(totalRes.rows) && totalRes.rows[0]
      ? (totalRes.rows[0].c as number)
      : 0;

  // Page of ads
  const adRows = await db
    .select({
      id: ads.id,
      slug: ads.slug,
      title: ads.title,
      description: ads.description,
      created: ads.creationTimeStamp,
    })
    .from(ads)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(pageSize)
    .offset(offset);

  if (adRows.length === 0) {
    return { items: [], total, page, pageSize };
  }

  // Fetch images for counts and also primary images for thumbnail
  const adIds = adRows.map((r) => r.id);

  // All images for counts
  const imageRows = await db
    .select({ adsId: images.adsId, publicId: images.url }) // we store public_id in the url field (<=50)
    .from(images)
    .where(inArray(images.adsId, adIds))
    .orderBy(images.adsId, images.id);

  // Primary images per ad for thumbnail
  const primaryRows = await db
    .select({ adsId: images.adsId, publicId: images.url })
    .from(images)
    .where(and(inArray(images.adsId, adIds), eq(images.primaryImage, true)));

  const primaryImageByAd = new Map<number, string>();
  for (const row of primaryRows) {
    if (row.adsId != null && row.publicId) {
      primaryImageByAd.set(row.adsId, row.publicId);
    }
  }

  const imageCountByAd = new Map<number, number>();
  for (const row of imageRows) {
    if (row.adsId != null) {
      imageCountByAd.set(row.adsId, (imageCountByAd.get(row.adsId) || 0) + 1);
    }
  }

  // Ensure Cloudinary is configured for URL generation
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name) {
    // For URL generation, cloud_name is enough; include keys if available
    cloudinary.config({ cloud_name, api_key, api_secret } as ConfigOptions);
  }

  const items: Ad[] = adRows.map((r) => {
    const publicId = primaryImageByAd.get(r.id);
    let thumbnail: string | undefined = undefined;
    if (publicId) {
      // Generate a small, cropped thumbnail URL
      thumbnail = cloudinary.url(publicId, {
        width: 256,
        height: 256,
        crop: "fill",
        gravity: "auto",
        fetch_format: "jpg",
        quality: 100,
        secure: true,
      });
    }
    const imageCount = imageCountByAd.get(r.id) || 0;
    return {
      id: r.id,
      slug: (r as any).slug ?? r["slug" as keyof typeof r],
      title: r.title,
      description: r.description,
      thumbnail,
      imageCount,
      created: r.created,
    };
  });

  return { items, total, page, pageSize };
}
