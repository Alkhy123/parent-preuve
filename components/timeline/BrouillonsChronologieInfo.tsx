"use client";

import Link from "next/link";
import { useState } from "react";

import {
  lireBrouillonsCollecteRapideDepuisLocalStorage,
  type BrouillonCollecteRapideLocal,
} from "@/lib/brouillonsCollecteRapide";

function formaterDate(dateIso: string): string {
  if (!dateIso) {
    return "Date à compléter";
  }

  try {
    return new Intl.DateTimeFormat("fr-FR").format(new Date(dateIso));
  } catch {
    return dateIso;
  }
}

function libelleBrouillons(nombre: number): string {
  if (nombre === 0) {
    return "Aucun brouillon local détecté.";
  }

  if (nombre === 1) {
    return "1 brouillon local à traiter.";
  }

  return `${nombre} brouillons locaux à traiter.`;
}

export default function BrouillonsChronologieInfo() {
  const [brouillons, setBrouillons] = useState<BrouillonCollecteRapideLocal[]>(
    [],
  );
  const [verificationFaite, setVerificationFaite] = useState(false);

  function verifierBrouillons() {
    setBrouillons(lireBrouillonsCollecteRapideDepuisLocalStorage());
    setVerificationFaite(true);
  }

  const derniersBrouillons = brouillons.slice(0, 3);

  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
            Brouillons locaux
          </p>

          <h2 className="mt-1 text-xl font-bold text-[var(--app-text)]">
            Vérifier les brouillons avant de lire la chronologie
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
            Les brouillons issus de la collecte rapide ne sont pas ajoutés
            automatiquement à la chronologie. Ils doivent être relus, ouverts
            dans le bon module, puis enregistrés manuellement.
          </p>
        </div>

        <button
          type="button"
          onClick={verifierBrouillons}
          className="rounded-lg border border-[#15233F] px-5 py-2 text-sm font-semibold text-[#15233F] hover:bg-[#15233F] hover:text-white"
        >
          Vérifier ce navigateur
        </button>
      </div>

      {verificationFaite && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white/70 p-4">
          <p className="font-semibold text-[var(--app-text)]">
            {libelleBrouillons(brouillons.length)}
          </p>

          {brouillons.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
              Aucun brouillon local n’a été trouvé dans ce navigateur. La
              chronologie affiche uniquement les éléments déjà enregistrés dans
              le dossier.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                Ces brouillons ne sont pas encore des éléments du dossier. Ils
                ne seront visibles dans la chronologie qu’après validation dans
                le module correspondant.
              </p>

              <div className="mt-4 grid gap-3">
                {derniersBrouillons.map((brouillon) => (
                  <article
                    key={brouillon.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
                      {brouillon.type}
                    </p>

                    <h3 className="mt-1 font-semibold text-[var(--app-text)]">
                      {brouillon.titre || "Brouillon sans titre"}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                      Date : {formaterDate(brouillon.date)} · Enfant :{" "}
                      {brouillon.enfant || "à compléter"}
                    </p>
                  </article>
                ))}
              </div>

              {brouillons.length > derniersBrouillons.length && (
                <p className="mt-3 text-sm text-[var(--app-text-muted)]">
                  {brouillons.length - derniersBrouillons.length} autre
                  {brouillons.length - derniersBrouillons.length > 1
                    ? "s brouillon(s)"
                    : " brouillon"}{" "}
                  à consulter dans l’espace Organiser.
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/organiser/brouillons"
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d2f52]"
                >
                  Traiter les brouillons
                </Link>

                <Link
                  href="/collecter/rapide"
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-[#15233F] hover:border-[#C2A24C]/70"
                >
                  Créer un brouillon
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
