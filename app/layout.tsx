import type { Metadata, Viewport } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";

import "./globals.css";

import NavBar from "@/components/NavBar";
import BandeauProcedure from "@/components/BandeauProcedure";
import Footer from "@/components/Footer";
import GardeAcces from "@/components/GardeAcces";
import BienvenueRGPD from "@/components/BienvenueRGPD";
import MajServiceWorker from "@/components/MajServiceWorker";
import BoutonCaptureRapide from "@/components/BoutonCaptureRapide";
import AssistantFlottant from "@/components/AssistantFlottant";
import ThemeProvider from "@/components/theme/ThemeProvider";

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
  appleWebApp: {
    capable: true,
    title: "Parent Preuve",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#15233F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* No-flash : applique le thème mémorisé avant le rendu React. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('parent-preuve-theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}",
          }}
        />

        <ThemeProvider />

        <NavBar />
        <BandeauProcedure />

        <main className="flex-1">
          <GardeAcces>{children}</GardeAcces>
        </main>

        <Footer />
        <BienvenueRGPD />
        <MajServiceWorker />
        <BoutonCaptureRapide />
        <AssistantFlottant />
      </body>
    </html>
  );
}
