"use server";

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
