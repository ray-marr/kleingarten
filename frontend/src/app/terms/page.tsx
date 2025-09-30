export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="prose prose-emerald max-w-none">
      <h1>Nutzungsbedingungen</h1>
      <p>
        Kleingarten stellt eine Plattform bereit, auf der Nutzerinnen und Nutzer
        private Anzeigen rund um Schrebergärten veröffentlichen und finden
        können. Wir sind nicht Partei der über die Plattform angebahnten
        Geschäfte.
      </p>
      <h2>Grundsätze</h2>
      <ul>
        <li>Du veröffentlichst nur wahrheitsgemäße und rechtlich zulässige Inhalte.</li>
        <li>Du respektierst Vereins- und Gesetzesvorgaben für Parzellen.</li>
        <li>Wir dürfen Inhalte prüfen, anpassen oder entfernen, wenn notwendig.</li>
      </ul>
      <h2>Haftung</h2>
      <p>
        Für Inhalte der Nutzer sind diese selbst verantwortlich. Wir haften nicht
        für Schäden aus privaten Geschäften zwischen Nutzern.
      </p>
      <h2>Beendigung</h2>
      <p>
        Wir können Accounts oder Inhalte sperren/entfernen, wenn gegen Regeln
        verstoßen wird oder Missbrauch vorliegt.
      </p>
      <p>
        Diese Zusammenfassung dient der Verständlichkeit. Im Zweifel gilt die
        ausführliche Fassung, die wir auf Anfrage bereitstellen.
      </p>
    </div>
  );
}
