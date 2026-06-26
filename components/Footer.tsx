"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ROUTES_NOUVEAU_SHELL = ["/", "/journal", "/compte", "/frais", "/documents", "/preuves", "/preuves/nouvelle", "/calendrier", "/calendrier/avance"];

export default function Footer() {
  const pathname = usePathname();
  const [connecte, setConnecte] = useState<boolean | null>(null);
  const annee = new Date().getFullYear();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  if (ROUTES_NOUVEAU_SHELL.includes(pathname) && connecte !== false) return null;

  return (
    <footer className="mt-auto bg-[#15233F] text-[#F8F6F1]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="font-display text-lg">Parent Preuve</p>
        <div className="mt-2 h-px w-12 bg-[#C2A24C]" />
        <p className="mt-3 max-w-xl text-sm text-[#F8F6F1]/70">
          Aide à l&apos;organisation d&apos;un dossier factuel de coparentalité. Ne constitue pas
          un conseil juridique.
        </p>

        <nav className="mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
          <Link href="/mentions-legales" className="lien-pied">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="lien-pied">
            Politique de confidentialité
          </Link>
        </nav>

        <p className="mt-6 text-xs text-[#F8F6F1]/50">© {annee} Parent Preuve</p>
      </div>
    </footer>
  );
}
