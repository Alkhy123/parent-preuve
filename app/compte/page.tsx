"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import AppShell from "@/components/app/AppShell";
import ThemeSelector from "@/components/theme/ThemeSelector";

export default function ComptePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [confirmation, setConfirmation] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [exportEnCours, setExportEnCours] = useState(false);
  const [exportErreur, setExportErreur] = useState<string | null>(null);

  // Page réservée aux utilisateurs connectés.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/connexion");
        return;
      }
      setEmail(data.user.email ?? null);
      setChargement(false);
    });
  }, [router]);

  async function supprimerCompte() {
    setErreur(null);
    setSuppressionEnCours(true);
    try {
      const reponse = await fetch("/api/compte/supprimer", {
        method: "DELETE",
        headers: { ...(await enteteAuth()) },
      });
      if (!reponse.ok) {
        const data = await reponse.json().catch(() => ({}));
        setErreur(data.erreur ?? "La suppression a échoué. Réessayez.");
        setSuppressionEnCours(false);
        return;
      }
      // Succès : déconnexion locale puis retour à l'accueil.
      await supabase.auth.signOut();
      router.replace("/");
    } catch {
      setErreur("La suppression a échoué. Vérifiez votre connexion et réessayez.");
      setSuppressionEnCours(false);
    }
  }

  async function exporterDonnees() {
    setExportErreur(null);
    setExportEnCours(true);
    try {
      const reponse = await fetch("/api/compte/exporter", {
        method: "GET",
        headers: { ...(await enteteAuth()) },
      });
      if (!reponse.ok) {
        const data = await reponse.json().catch(() => ({}));
        setExportErreur(data.erreur ?? "L'export a échoué. Réessayez.");
        return;
      }
      // Téléchargement du JSON renvoyé.
      const blob = await reponse.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `parent-preuve-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportErreur("L'export a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setExportEnCours(false);
    }
  }

  if (chargement) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-[#1F2733]">Chargement…</div>;
  }

  const peutSupprimer = confirmation.trim() === "SUPPRIMER" && !suppressionEnCours;

  return (
    <AppShell
      activeModule="parametres"
      title="Mon compte"
      subtitle="Vos informations, l'apparence et la gestion de votre compte."
      copilotContext="parametres"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Informations */}
        <section className="carte rounded-lg bg-white p-5">
          <h2 className="font-display text-xl text-[#15233F]">Informations</h2>
          <p className="mt-2 text-sm">
            Adresse e-mail : <strong>{email}</strong>
          </p>
          <p className="mt-2 text-sm">
            Pour savoir quelles données sont traitées et connaître vos droits, consultez la{" "}
            <Link href="/confidentialite" className="text-[#15233F] underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        {/* Apparence */}
        <section className="carte rounded-lg bg-white p-5">
          <h2 className="font-display text-xl text-[#15233F]">Apparence</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choisissez le style visuel de votre espace Parent Preuve. Ce réglage
            modifie uniquement l&apos;apparence de l&apos;application sur cet appareil.
          </p>
          <div className="mt-4">
            <ThemeSelector />
          </div>
        </section>

        {/* Export de portabilité (RGPD) */}
        <section className="carte rounded-lg bg-white p-5">
          <h2 className="font-display text-xl text-[#15233F]">Exporter mes données</h2>
          <p className="mt-2 text-sm">
            Téléchargez l&apos;intégralité de vos données personnelles dans un fichier
            JSON (procédures, enfants, journal, frais, pension, règles, documents et
            preuves), avec des liens de téléchargement temporaires pour vos fichiers.
            C&apos;est votre droit à la portabilité ; ce fichier est distinct du dossier
            pour l&apos;avocat.
          </p>

          {exportErreur && <p className="mt-3 text-sm text-[#9B2C2C]">{exportErreur}</p>}

          <button
            onClick={exporterDonnees}
            disabled={exportEnCours}
            className="mt-4 rounded bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d2f52] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exportEnCours ? "Préparation de l'export…" : "Exporter mes données (JSON)"}
          </button>
        </section>

        {/* Zone de suppression */}
        <section className="rounded-lg border border-[#9B2C2C]/30 bg-white p-5">
          <h2 className="font-display text-xl text-[#9B2C2C]">Supprimer mon compte</h2>
          <p className="mt-2 text-sm">
            Cette action est <strong>définitive et irréversible</strong>. Elle efface votre
            compte ainsi que toutes vos données : journal, frais, pensions, documents, preuves
            et leurs fichiers, règles et dossier. Aucune récupération n&apos;est possible.
          </p>

          <label className="mt-4 block text-sm">
            Pour confirmer, tapez <strong>SUPPRIMER</strong> :
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#9B2C2C] focus:outline-none"
              placeholder="SUPPRIMER"
              autoComplete="off"
            />
          </label>

          {erreur && <p className="mt-3 text-sm text-[#9B2C2C]">{erreur}</p>}

          <button
            onClick={supprimerCompte}
            disabled={!peutSupprimer}
            className="mt-4 rounded bg-[#9B2C2C] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7f2424] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {suppressionEnCours
              ? "Suppression en cours…"
              : "Supprimer définitivement mon compte"}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
