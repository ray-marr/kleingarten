import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSansFont = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMonoFont = Geist_Mono({
  variable: "--font-geist-mono",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
          className={`${geistSansFont.variable} ${geistMonoFont.variable} antialiased min-h-screen flex flex-col`}
          style={{backgroundColor: "#e7dad9"}}
      >
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-6 flex-1 w-full">
            <div className="flex">
                {children}
            </div>
        </main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
