"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { enteteAuth } from "@/lib/enteteAuth";
import { supabase } from "@/lib/supabase";

export default function ComptePage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [confirmation, setConfirmation] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [exportEnCours, setExportEnCours] = useState(false);
  const [exportErreur, setExportErreur] = useState<string | null>(null);

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
        headers: {
          ...(await enteteAuth()),
        },
      });

      if (!reponse.ok) {
        const data = await reponse.json().catch(() => ({}));
        setErreur(data.erreur ?? "La suppression a echoue. Reessayez.");
        setSuppressionEnCours(false);
        return;
      }

      await supabase.auth.signOut();
      router.replace("/");
    } catch {
      setErreur(
        "La suppression a echoue. Verifiez votre connexion et reessayez.",
      );
      setSuppressionEnCours(false);
    }
  }

  async function exporterDonnees() {
    setExportErreur(null);
    setExportEnCours(true);

    try {
      const reponse = await fetch("/api/compte/exporter", {
        method: "GET",
        headers: {
          ...(await enteteAuth()),
        },
      });

      if (!reponse.ok) {
        const data = await reponse.json().catch(() => ({}));
        setExportErreur(data.erreur ?? "L'export a echoue. Reessayez.");
        return;
      }

      const blob = await reponse.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `parent-preuve-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportErreur(
        "L'export a echoue. Verifiez votre connexion et reessayez.",
      );
    } finally {
      setExportEnCours(false);
    }
  }

  if (chargement) {
    return (
      <AppShell
        titre="Mon compte"
        description="Chargement des informations du compte."
      >
        <AppCard>
          <p className="text-sm text-[var(--app-text-muted)]">Chargement...</p>
        </AppCard>
      </AppShell>
    );
  }

  const peutSupprimer =
    confirmation.trim() === "SUPPRIMER" && !suppressionEnCours;

  return (
    <AppShell
      titre="Mon compte"
      description="Gerez les informations du compte, l'apparence locale, l'export RGPD et la suppression des donnees."
      actions={
        <AppButtonLink href="/" variant="secondary">
          Retour accueil
        </AppButtonLink>
      }
    >
      <div className="space-y-6">
        <AppCard titre="Informations">
          <div className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
            <p>
              Adresse e-mail :{" "}
              <span className="font-semibold text-[var(--app-text)]">
                {email}
              </span>
            </p>

            <p>
              Pour savoir quelles donnees sont traitees et connaitre vos
              droits, consultez la{" "}
              <Link
                href="/confidentialite"
                className="font-semibold text-[var(--app-primary)] underline-offset-4 hover:underline"
              >
                politique de confidentialite
              </Link>
              .
            </p>
          </div>
        </AppCard>

        <AppCard
          titre="Apparence"
          description="Choisissez le style visuel de votre espace Parent Preuve. Ce reglage modifie uniquement l'apparence de l'application sur cet appareil."
        >
          <ThemeSelector />
        </AppCard>

        <AppCard
          titre="Exporter mes donnees"
          description="Telechargez l'integralite de vos donnees personnelles dans un fichier JSON. Ce fichier est distinct du dossier pour l'avocat."
        >
          <div className="space-y-4">
            <AppNotice titre="Portabilite RGPD">
              <p>
                L'export peut inclure procedures, enfants, journal, frais,
                pension, regles, documents et preuves, avec des liens de
                telechargement temporaires pour les fichiers.
              </p>
            </AppNotice>

            {exportErreur ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {exportErreur}
              </p>
            ) : null}

            <button
              type="button"
              onClick={exporterDonnees}
              disabled={exportEnCours}
              className="inline-flex rounded-full bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-on-primary)] transition hover:bg-[var(--app-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportEnCours
                ? "Preparation de l'export..."
                : "Exporter mes donnees (JSON)"}
            </button>
          </div>
        </AppCard>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">
            Supprimer mon compte
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-800">
            Cette action est definitive et irreversible. Elle efface votre
            compte ainsi que toutes vos donnees : journal, frais, pensions,
            documents, preuves et leurs fichiers, regles et dossier. Aucune
            recuperation n'est possible.
          </p>

          <label className="mt-4 block text-sm font-medium text-red-900">
            Pour confirmer, tapez SUPPRIMER :
            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 focus:border-red-600 focus:outline-none"
              placeholder="SUPPRIMER"
              autoComplete="off"
            />
          </label>

          {erreur ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-700">
              {erreur}
            </p>
          ) : null}

          <button
            type="button"
            onClick={supprimerCompte}
            disabled={!peutSupprimer}
            className="mt-4 inline-flex rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {suppressionEnCours
              ? "Suppression en cours..."
              : "Supprimer definitivement mon compte"}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
