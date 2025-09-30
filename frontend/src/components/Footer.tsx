import Link from "next/link";

export default function Footer() {
  const links = [
    { href: "/about", label: "Über uns" },
    { href: "/help", label: "Hilfe" },
    { href: "/safety", label: "Sicherheit" },
    { href: "/privacy", label: "Datenschutz" },
    { href: "/terms", label: "Nutzungsbedingungen" },
    { href: "/contact", label: "Kontakt" },
  ];

  return (
    <footer className="mt-10 border-t border-gray-700 bg-[#4b463d] text-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-4 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link className="hover:text-white" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-4 text-xs text-gray-300">
          © {new Date().getFullYear()} Kleingarten. Mit Sorge gepflanzt 🌱
        </p>
      </div>
    </footer>
  );
}
