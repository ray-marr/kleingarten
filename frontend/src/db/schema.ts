import {
  integer,
  pgTable,
  serial,
  text,
  varchar,
  customType,
  timestamp,
  pgEnum,
  boolean,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const adStatusEnum = pgEnum("ad_statuses", ["OPEN", "CLOSED", "HIDDEN"]);

// Custom PostGIS geography(Point,4326) type
export const geographyPoint = customType<{
  data: unknown;
  driverData: unknown;
}>({
  dataType() {
    return "geography(Point,4326)";
  },
  toDriver() {
    // Pass-through; you can serialize to WKT or GeoJSON upstream as needed
    return sql.raw("$1");
  },
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username"),
  telephone: text("telephone"),
  email: text("email"),
});

export const ads = pgTable(
  "ads",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 8 }).unique().notNull(),
    title: varchar("title", { length: 50 }).notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    userId: integer("user_id").references(() => users.id),
    // Use raw SQL column definition in migration for full PostGIS support. In runtime, treat as unknown.
    // Drizzle schema uses a custom type placeholder for typing.
    coordinates: geographyPoint("coordinates" as never),
    address: varchar("address", { length: 100 }),
    creationTimeStamp: timestamp("created_at").defaultNow().notNull(),
    status: adStatusEnum().notNull().default("OPEN"),
  },
  (table) => [
    check("slugUrlSafeCheck", sql`${table.slug} ~ '^[A-Za-z0-9]{1,8}$'`),
  ],
);

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  adsId: integer("ads_id").references(() => ads.id),
  imageName: varchar("image_name", { length: 50 }),
  url: varchar("url", { length: 50 }),
  primaryImage: boolean("primary_image").default(false).notNull(),
});
