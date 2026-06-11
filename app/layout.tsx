import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import BandeauProcedure from "@/components/BandeauProcedure";
import Footer from "@/components/Footer";
import GardeAcces from "@/components/GardeAcces";
import BienvenueRGPD from "@/components/BienvenueRGPD";
import { Playfair_Display } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Parent Preuve",
  description:
    "Centralisez frais, pension, justificatifs et événements pour préparer un dossier clair, daté et factuel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <BandeauProcedure />
        <main className="flex-1">
          <GardeAcces>{children}</GardeAcces>
        </main>
        <Footer />
        <BienvenueRGPD />
      </body>
    </html>
  );
}
