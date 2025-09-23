export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl bg-emerald-700 text-yellow-100">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true" />
        <div className="px-6 py-14 sm:px-10 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Finde, tausche und verkaufe Ernte aus deinem Kleingarten
          </h1>
          <p className="mt-4 max-w-2xl text-emerald-50 text-lg">
            Zu viele Kürbisse oder Äpfel dieses Jahr? Eine Beere treibt Ableger? 
            Teile Überschüsse, entdecke Besonderes aus der Nachbarschaft und lasse Pflanzen ein neues Zuhause finden.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#search-item"
              className="inline-flex items-center justify-center rounded-sm bg-yellow-100 px-5 py-2.5 font-semibold text-emerald-800 hover:bg-yellow-200"
            >
              Angebote entdecken
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-sm border border-yellow-200/70 px-5 py-2.5 font-semibold text-yellow-100 hover:bg-emerald-600"
            >
              Angebot einstellen
            </a>
          </div>
        </div>
      </section>

      {/* Inspiration grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article className="rounded-lg bg-white/70 backdrop-blur p-5 shadow-sm border border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-900">Ernte teilen</h2>
          <p className="mt-2 text-emerald-900/80">Kürbisse 🎃, Äpfel 🍎, Zucchini oder Kräuter – biete Überschüsse an oder entdecke saisonale Schätze in deiner Nähe.</p>
        </article>
        <article className="rounded-lg bg-white/70 backdrop-blur p-5 shadow-sm border border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-900">Pflanzen weitergeben</h2>
          <p className="mt-2 text-emerald-900/80">Ableger, Büsche, Stauden 🌱 – verschenke oder tausche, damit Gutes weiterwächst.</p>
        </article>
        <article className="rounded-lg bg-white/70 backdrop-blur p-5 shadow-sm border border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-900">Nachbarschaft stärken</h2>
          <p className="mt-2 text-emerald-900/80">Lerne andere Kleingärtner:innen kennen, tausche Tipps und baue ein lokales Netzwerk auf.</p>
        </article>
      </section>

      {/* How it works */}
      <section className="rounded-xl bg-white/80 backdrop-blur p-6 shadow-sm border border-emerald-100">
        <h2 className="text-2xl font-bold text-emerald-900">So funktioniert’s</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3 hiw-steps">
          <li className="rounded-md border border-emerald-100 bg-white p-6">
            <p className="font-semibold text-emerald-900">Suchen</p>
            <p className="text-emerald-900/80">Nutze die Suche oben - z.B. &quot;Äpfel&quot; oder &quot;Ableger&quot;, optional mit Ort/PLZ.</p>
          </li>
          <li className="rounded-md border border-emerald-100 bg-white p-6">
            <p className="font-semibold text-emerald-900">Kontakt aufnehmen</p>
            <p className="text-emerald-900/80">Vereinbare Abholung oder Tausch direkt in der Nachbarschaft.</p>
          </li>
          <li className="rounded-md border border-emerald-100 bg-white p-6">
            <p className="font-semibold text-emerald-900">Selbst anbieten</p>
            <p className="text-emerald-900/80">Stelle deine eigenen Angebote ein - vom Überschuss bis zur besonderen Pflanze.</p>
          </li>
        </ol>
        <div className="mt-6">
          <a href="#search-item" className="inline-block rounded-sm bg-emerald-700 px-4 py-2 font-semibold text-yellow-100 hover:bg-emerald-800">Jetzt loslegen</a>
        </div>
      </section>
    </div>
  );
}
