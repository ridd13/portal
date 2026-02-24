import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSiteUrl } from "@/lib/site-url";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Das Portal | Ganzheitliche Events",
    template: "%s | Das Portal",
  },
  description:
    "Event-Plattform für ganzheitliche und spirituelle Events in deutschsprachigen Städten.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "Das Portal",
    title: "Das Portal | Ganzheitliche Events",
    description:
      "Entdecke Tanz-, Meditations- und Coaching-Events in deiner Nähe.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Das Portal Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Das Portal | Ganzheitliche Events",
    description:
      "Entdecke Tanz-, Meditations- und Coaching-Events in deiner Nähe.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen bg-bg-primary text-text-primary">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
