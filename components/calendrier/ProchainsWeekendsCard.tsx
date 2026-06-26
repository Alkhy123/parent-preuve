"use client";

// Carte d'aperçu « Prochains week-ends de garde », présentationnelle.
// Utilise le calcul existant prochainsWeekends (inchangé) ; n'invente aucune
// échéance. État vide explicite si aucune date de référence n'est renseignée.

import { prochainsWeekends, type RegleGarde } from "@/lib/gardeCalendrier";
import { vacancesQuiChevauchent } from "@/lib/calendrier/chevauchementVacances";
import type { PeriodeVacances } from "@/lib/calendrier/types";

const fmt = (d: Date) =>
  d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtHeure = (d: Date) =>
  d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export default function ProchainsWeekendsCard({
  regle,
  vacances,
}: {
  regle: RegleGarde | null;
  vacances: PeriodeVacances[];
}) {
  const apercu = regle ? prochainsWeekends(regle, 8) : [];

  return (
    <section
      className="rounded-lg border p-5"
      style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      <h2 className="font-display text-xl mb-3" style={{ color: "var(--app-text)" }}>
        Prochains week-ends de garde
      </h2>
      {apercu.length === 0 ? (
        <p className="text-sm text-slate-500">Renseigne une date de référence pour voir l&apos;aperçu.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {apercu.map((p, i) => {
            const vac = vacancesQuiChevauchent(p.debut, p.fin, vacances);
            return (
              <li key={i} className="py-3 flex items-start gap-3">
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: p.chezQui === "moi" ? "var(--app-accent)" : "var(--app-text-muted)" }}
                />
                <span style={{ color: "var(--app-text)" }}>
                  Du <strong>{fmt(p.debut)}</strong> {fmtHeure(p.debut)} au{" "}
                  <strong>{fmt(p.fin)}</strong> {fmtHeure(p.fin)}
                  <span className="block text-xs text-slate-500">
                    {p.chezQui === "moi" ? "Garde chez moi" : "Garde chez l'autre parent"}
                  </span>
                  {vac && (
                    <span
                      className="mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: "var(--app-banner-bg)", borderColor: "var(--app-banner-border)", color: "var(--app-banner-text)" }}
                    >
                      ⚠ {vac.nom} — répartition selon le jugement
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {apercu.some((p) => vacancesQuiChevauchent(p.debut, p.fin, vacances)) && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Certains week-ends tombent pendant les vacances scolaires. La règle
          « un week-end sur deux » peut alors ne pas s&apos;appliquer : la
          répartition des vacances est fixée par votre jugement. Vérifiez votre
          décision et, au besoin, ajustez via le calendrier avancé.
        </p>
      )}
    </section>
  );
}
