export const metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <div className="prose prose-emerald max-w-none">
      <h1>Hilfe & FAQ</h1>
      <h2>Wie finde ich Angebote?</h2>
      <p>
        Nutze die Suchleiste oben. Du kannst einen Suchbegriff (z. B.
        &quot;Rasenmäher&quot;, &quot;Parzelle&quot;) und optional einen Ort
        oder eine PLZ eingeben. Die Ergebnisseite zeigt dir passende Einträge
        mit Bildern und Entfernung.
      </p>
      <h2>Wie kontaktiere ich Anbietende?</h2>
      <p>
        Öffne ein Angebot und nutze die dort angegebenen Kontaktwege. Teile
        niemals sensible Daten und lies vorher unsere Sicherheitstipps.
      </p>
      <h2>Was darf ich einstellen?</h2>
      <ul>
        <li>Gartenparzellen (Pacht/Abgabe nach Vereinsregeln)</li>
        <li>Werkzeuge, Geräte, Materialien</li>
        <li>Pflanzen, Setzlinge, Saatgut (im rechtlichen Rahmen)</li>
        <li>Nachbarschaftshilfe rund um den Garten</li>
      </ul>
      <p>
        Nicht erlaubt sind illegale Inhalte, Betrug, oder Angebote, die gegen
        Vereins- oder Gesetzesregeln verstoßen.
      </p>
    </div>
  );
}
