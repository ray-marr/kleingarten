export const metadata = { title: "Safety" };

export default function SafetyPage() {
  return (
    <div className="prose prose-emerald max-w-none">
      <h1>Sicherheitstipps</h1>
      <ul>
        <li>Trefft euch möglichst an öffentlichen Orten im Hellen.</li>
        <li>Nimm eine Begleitperson mit, wenn du große Werte besichtigst.</li>
        <li>Leiste keine Vorauszahlungen an Unbekannte.</li>
        <li>Prüfe Ware vor Ort sorgfältig und dokumentiere den Zustand.</li>
        <li>
          Teile keine sensiblen Daten (Ausweisfotos, Bankzugänge, komplette
          Anschriften in Chats etc.).
        </li>
        <li>
          Bei Parzellenübernahmen: Kläre Vereinsregeln, Pachtverträge und
          Abnahmen zwingend offiziell.
        </li>
        <li>Nutze sichere Zahlungsmethoden und Quittungen.</li>
      </ul>
      <p>
        Melde verdächtige Angebote bitte umgehend, damit wir diese prüfen
        können.
      </p>
    </div>
  );
}
