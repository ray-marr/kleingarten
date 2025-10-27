"use server";

import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { ads, images } from "@/db/schema";
import { sql } from "drizzle-orm";
import { generateRandomSlug } from "@/app/_helpers/stringTools";

const MAX_FILES = 5;

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: { title?: string; description?: string; images?: string };
};

export async function createAdvert(formData: FormData): Promise<ActionResult> {
  const title = (formData.get("title") as string | null)?.trim() || "";
  const description =
    (formData.get("description") as string | null)?.trim() || "";
  const imagePublicIds = formData
    .getAll("imagePublicId")
    .map((v) => String(v))
    .filter(Boolean);

  const errors: ActionResult["fieldErrors"] = {};

  if (!title) {
    errors.title = "Titel ist erforderlich";
  } else if (title.length > 50) {
    errors.title = "Maximal 50 Zeichen";
  }
  if (!description) {
    errors.description = "Beschreibung ist erforderlich";
  } else if (description.length > 500) {
    errors.description = "Maximal 500 Zeichen";
  }
  if (imagePublicIds.length > MAX_FILES) {
    errors.images = `Maximal ${MAX_FILES} Bilder erlaubt`;
  }
  if (imagePublicIds.some((id) => id.length > 50)) {
    errors.images = "Bild-IDs dürfen maximal 50 Zeichen lang sein";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, fieldErrors: errors };
  }

  // Ensure dummy user id=1 exists to satisfy FK
  await db.execute(
    sql`INSERT INTO users (id, username) VALUES (1, 'dummy') ON CONFLICT (id) DO NOTHING;`,
  );

  // Insert the advert first
  const [ad] = await db
    .insert(ads)
    .values({ title, description, userId: 1, slug: generateRandomSlug() })
    .returning({ id: ads.id });

  // Save images metadata using public_id as image name (<= 50 chars)
  if (imagePublicIds.length > 0) {
    await db.insert(images).values(
      imagePublicIds.map((public_id, idx) => ({
        adsId: ad.id,
        imageName: public_id,
        url: public_id,
        primaryImage: idx === 0, // first image is the Titelbild
      })),
    );
  }

  // Redirect to home for now; could go to ad detail in der Zukunft
  redirect("/");
}
