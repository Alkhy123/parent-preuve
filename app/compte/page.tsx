"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import PageHeader from "@/components/PageHeader";

export default function ComptePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [confirmation, setConfirmation] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

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

  if (chargement) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-[#1F2733]">Chargement…</div>;
  }

  const peutSupprimer = confirmation.trim() === "SUPPRIMER" && !suppressionEnCours;

  return (
    <>
      <PageHeader
        eyebrow="Votre compte"
        title="Mon compte"
        subtitle="Vos informations et la gestion de votre compte."
      />

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8 text-[#1F2733]">
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
    </>
  );
}