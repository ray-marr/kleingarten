export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="prose prose-emerald max-w-none">
      <h1>Kontakt</h1>
      <p>
        Du hast Fragen, möchtest einen Verstoß melden oder Feedback geben? Wir
        freuen uns über deine Nachricht.
      </p>
      <h2>So erreichst du uns</h2>
      <ul>
        <li>E-Mail: support@kleingarten.example</li>
        <li>Hinweis: Bitte keine sensiblen Daten per E-Mail senden.</li>
      </ul>
      <h2>Schnelle Hilfe</h2>
      <ul>
        <li>
          Schau zuerst in die <a href="/help">Hilfe & FAQ</a> – viele Fragen
          lassen sich dort sofort klären.
        </li>
        <li>
          Beachte unsere <a href="/safety">Sicherheitstipps</a> vor Treffen und
          Zahlungen.
        </li>
      </ul>
    </div>
  );
}
