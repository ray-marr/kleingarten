import Link from "next/link";
import { searchAds } from "./actions";
import Image from "next/image";

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = { searchParams: Promise<SearchParams> };

export default async function Results({ searchParams }: Props) {
  const { item, location, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  // Call server action on page load to get paginated mock results
  const { items, total, pageSize } = await searchAds({
    item,
    location,
    page,
    pageSize: 10,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Build found text with search criteria
  const itemLabel =
    typeof item === "string" && item.trim() ? `'${item.trim()}'` : "";
  const locationLabel =
    typeof location === "string" && location.trim()
      ? `'${location.trim()}'`
      : "";
  let foundText = `${total} Angebote gefunden`;
  if (itemLabel && locationLabel)
    foundText += ` matching ${itemLabel} in ${locationLabel}.`;
  else if (itemLabel) foundText += ` matching ${itemLabel}.`;
  else if (locationLabel) foundText += ` in ${locationLabel}.`;
  else foundText += ".";

  // Helper to preserve existing query params while changing the page
  const makePageHref = (p: number) => {
    const params = new URLSearchParams();
    if (typeof item === "string" && item) params.set("item", item);
    if (typeof location === "string" && location)
      params.set("location", location);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  console.log({ items });

  return (
    <div className="space-y-6 grow-1">
      <h1 className="text-2xl font-bold text-emerald-900">Ergebnisse</h1>
      <div className="space-y-3">
        <p className="text-emerald-900/80 text-sm">{foundText}</p>
        <ul className="grid grid-cols-1 gap-3">
          {items.map((ad) => (
            <li
              key={ad.id}
              className="w-full max-w-2xl h-24 overflow-hidden rounded-md bg-white text-emerald-900 shadow-md"
            >
              <div className="flex h-full items-stretch gap-3">
                <div className="relative">
                  {ad.thumbnail ? (
                    <Image
                      src={ad.thumbnail}
                      alt={ad.title}
                      className="h-24 w-24 object-cover"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <div className="h-24 w-24 bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                      {ad.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 p-1 rounded-sm backdrop-blur-md">
                    {/* todo: add icon and check number of images */}
                    {/*<Image src={cameraIcon} alt="Camera" width={20} height={20} />*/}
                    <span className="text-emerald-900/80 text-white ml-2">
                      1
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-3 pr-4 overflow-hidden content-center">
                  <h2 className="font-semibold text-2xl">{ad.title}</h2>
                  <p className="text-sm text-emerald-900/80">
                    Posted x days ago
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Link
            href={makePageHref(Math.max(1, page - 1))}
            className={`px-3 py-1 rounded border ${page === 1 ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
            aria-disabled={page === 1}
          >
            Zurück
          </Link>
          <div className="text-sm text-emerald-900/80">
            Seite {page} / {totalPages}
          </div>
          <Link
            href={makePageHref(Math.min(totalPages, page + 1))}
            className={`px-3 py-1 rounded border ${page === totalPages ? "pointer-events-none opacity-50" : "hover:bg-emerald-50"}`}
            aria-disabled={page === totalPages}
          >
            Weiter
          </Link>
        </div>
      )}
    </div>
  );
}
