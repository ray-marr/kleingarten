export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="prose prose-emerald max-w-none">
      <h1>Über Kleingarten</h1>
      <p>
        Kleingarten ist ein einfacher Marktplatz rund um das Thema
        Schrebergärten: Parzellen anbieten oder suchen, Geräte verleihen oder
        abgeben, Pflanzen tauschen und Hilfe in der Nachbarschaft finden.
      </p>
      <h2>Unsere Mission</h2>
      <p>
        Wir möchten das Tauschen und Handeln im Grünen so unkompliziert und
        sicher wie möglich machen – lokal, nachhaltig und fair.
      </p>
      <h2>Wie funktioniert es?</h2>
      <ol>
        <li>Suche nach Angeboten über die Suchleiste oben.</li>
        <li>Filtere nach Ort/PLZ, um passende Einträge in deiner Nähe zu finden.</li>
        <li>Nimm direkt Kontakt mit den Anbietenden auf.</li>
      </ol>
    </div>
  );
}
