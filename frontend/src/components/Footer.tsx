export default function Footer() {
  const links = [
    { href: "/about", label: "About" },
    { href: "/help", label: "Help" },
    { href: "/safety", label: "Safety" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="mt-10 border-t border-gray-700 bg-[#4b463d] text-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-4 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <a className="hover:text-white" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-4 text-xs text-gray-300">
          © {new Date().getFullYear()} Kleingarten. Plated with care 🌱
        </p>
      </div>
    </footer>
  );
}
