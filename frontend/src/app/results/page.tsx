type SearchParams = { [key: string]: string | string[] | undefined };

export default function Results({ searchParams }: { searchParams: SearchParams }) {
  const item = (searchParams["item"] ?? "") as string;
  const location = (searchParams["location"] ?? "") as string;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-emerald-900">Ergebnisse</h1>
      <div className="rounded-md border border-emerald-100 bg-white p-4 text-emerald-900">
        <p className="text-sm text-emerald-900/80">Deine Suche:</p>
        <ul className="mt-2 list-disc pl-5">
          <li><span className="font-semibold">Was:</span> {item || "—"}</li>
          <li><span className="font-semibold">Ort/PLZ:</span> {location || "—"}</li>
        </ul>
      </div>
      <p className="text-emerald-900/80 text-sm">Hier könnten künftig gefundene Angebote angezeigt werden.</p>
    </div>
  );
}
