"use client";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { useSearchParams } from "next/navigation";
const caveatFont = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export default function Header() {
  const params = useSearchParams();
  const itemValue = params.get("item") || "";
  const locationValue = params.get("location") || "";

  return (
    <header className="border-b bg-emerald-600 text-white">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="flex items-baseline gap-2 mr-4">
            <span aria-hidden="true" className="flex items-center self-center">
              {/* Logo */}
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
                  maskPosition: "center",
                }}
              />
            </span>
            {/* Title */}
            <Link
              href="/"
              className={`text-3xl font-bold ${caveatFont.className}`}
            >
              Kleingarten
            </Link>
          </div>
          {/*  Search form  */}
          <form
            className="flex w-full flex-col gap-2 md:flex-row"
            role="search"
            aria-label="Kleingärten durchsuchen"
            action="/results"
            method="get"
          >
            <div className="flex-1">
              <label htmlFor="search-item" className="sr-only">
                Kleingärten durchsuchen
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500"
                >
                  {/* Magnifying glass icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 1 0 3.473 9.78l3.623 3.624a.75.75 0 1 0 1.06-1.06l-3.624-3.624A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  id="search-item"
                  name="item"
                  type="search"
                  placeholder="Kleingärten durchsuchen"
                  defaultValue={itemValue}
                  className="w-full rounded-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </div>
            </div>
            <div className="md:w-80">
              <label htmlFor="search-location" className="sr-only">
                Ort oder PLZ
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500"
                >
                  {/* Location pin icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a6 6 0 0 0-6 6c0 4.418 6 10 6 10s6-5.582 6-10a6 6 0 0 0-6-6Zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  id="search-location"
                  name="location"
                  type="search"
                  placeholder="Ort oder PLZ"
                  defaultValue={locationValue}
                  className="w-full rounded-sm bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
              </div>
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
  );
}
