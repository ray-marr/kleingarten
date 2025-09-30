export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="prose prose-emerald max-w-none">
      <h1>Datenschutz</h1>
      <p>
        Wir nehmen Datenschutz ernst. Wir verarbeiten nur die Daten, die für den
        Betrieb des Marktplatzes nötig sind (z. B. technische Logs, Inhalte von
        Anzeigen). Wo möglich, werden Daten anonymisiert oder pseudonymisiert.
      </p>
      <h2>Welche Daten fallen an?</h2>
      <ul>
        <li>Nutzungsdaten (z. B. Seitenaufrufe, Gerätetyp)</li>
        <li>Inhaltsdaten (z. B. Titel, Beschreibung, Bilder deiner Anzeige)</li>
        <li>Kommunikationsdaten (z. B. Kontaktaufnahme zu Angeboten)</li>
      </ul>
      <h2>Deine Rechte</h2>
      <ul>
        <li>Auskunft und Berichtigung deiner Daten</li>
        <li>Löschung, sofern keine Aufbewahrungspflichten entgegenstehen</li>
        <li>Widerspruch gegen bestimmte Verarbeitungen</li>
      </ul>
      <p>
        Diese Seite ist eine verständliche Zusammenfassung. Rechtlich bindend ist
        die ausführliche Fassung, die wir auf Anfrage bereitstellen.
      </p>
    </div>
  );
}
