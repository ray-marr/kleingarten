import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSansFont = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMonoFont = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveatFont = Caveat({
    variable: "--font-caveat",
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Kleingarten", template: "%s | Kleingarten"} ,
  description: "Kleingarten handeln",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
          className={`${geistSansFont.variable} ${geistMonoFont.variable} antialiased`}
          style={{backgroundColor: "#e7dad9"}}
      >
        <header className="border-b bg-emerald-600 text-white">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="flex items-baseline gap-2 mr-4">
                <span aria-hidden="true" className="flex items-center self-center">
                  <div
                    aria-hidden="true"
                    className="h-8 w-8 text-yellow-200"
                    style={{
                      backgroundColor: "currentColor",
                      WebkitMaskImage: "url(/logo.svg)",
                      maskImage: "url(/logo.svg)",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskPosition: "center",
                      maskPosition: "center"
                    }}
                  />
                </span>
                <Link href="/" className={`text-3xl font-bold ${caveatFont.className}`}>
                  Kleingarten
                </Link>
              </div>
              <form
                className="flex w-full flex-col gap-2 md:flex-row"
                role="search"
                aria-label="Kleingärten durchsuchen"
              >
                <div className="flex-1">
                  <label htmlFor="search-item" className="sr-only">
                      Kleingärten durchsuchen
                  </label>
                  <input
                    id="search-item"
                    name="item"
                    type="search"
                    placeholder="Kleingärten durchsuchen"
                    className="w-full rounded-sm bg-white text-gray-900 placeholder:text-gray-600 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="md:w-80">
                  <label htmlFor="search-location" className="sr-only">
                      Ort oder PLZ
                  </label>
                  <input
                    id="search-location"
                    name="location"
                    type="search"
                    placeholder="Ort oder PLZ"
                    className="w-full rounded-sm bg-white text-gray-900 placeholder:text-gray-600 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center font-bold rounded-sm bg-yellow-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-yellow-200"
                >
                  Finden
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="mt-10 border-t border-gray-700 bg-[#4b463d] text-gray-200">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-4 text-sm">
                <li>
                  <a className="hover:text-white" href="/about">
                    About
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="/help">
                    Help
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="/safety">
                    Safety
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="/privacy">
                    Privacy
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="/terms">
                    Terms
                  </a>
                </li>
                <li>
                  <a className="hover:text-white" href="/contact">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
            <p className="mt-4 text-xs text-gray-300">
              © {new Date().getFullYear()} Kleingarten. Plated with care 🌱
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
