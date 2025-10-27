import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdBySlug } from "../actions";
import Carousel from "./Carousel";

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams: Promise<SearchParams> | SearchParams;
};

export default async function AdPage({ params, searchParams }: Props) {
  const { slug } = (await params) as { slug: string };
  const sp = (await searchParams) as SearchParams;

  const ad = await getAdBySlug(slug);
  if (!ad) return notFound();

  // Build back link to results preserving search params
  const makeBackHref = () => {
    const params = new URLSearchParams();
    const item = sp.item;
    const location = sp.location;
    const page = sp.page;
    if (typeof item === "string" && item) params.set("item", item);
    if (typeof location === "string" && location)
      params.set("location", location);
    if (typeof page === "string" && page) params.set("page", page);
    const query = params.toString();
    return `/results${query ? `?${query}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4">
        <Link
          href={makeBackHref()}
          className="text-emerald-700 hover:underline"
        >
          Zurück zu den Ergebnissen
        </Link>
        <h1 className="text-3xl font-bold text-emerald-900">{ad.title}</h1>
      </div>

      <Carousel images={ad.images} title={ad.title} />

      <section className="max-w-2xl">
        <h2 className="text-xl font-semibold text-emerald-900 mb-2">
          Beschreibung
        </h2>
        <p className="text-emerald-900/90 whitespace-pre-wrap">
          {ad.description}
        </p>
      </section>
    </div>
  );
}
