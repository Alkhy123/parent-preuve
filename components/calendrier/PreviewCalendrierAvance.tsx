"use client";

// components/calendrier/PreviewCalendrierAvance.tsx
//
// Prévisualisation (lecture seule) du planning calculé par le moteur avancé.
// Ne remplace pas le calendrier actuel : c'est un aperçu séparé.

import type { PlanningCalcule, PeriodeGardeCalculee } from "@/lib/calendrier/types";

function dateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Libellé sobre de l'origine d'une période.
function libelleOrigine(p: PeriodeGardeCalculee): string {
  if (p.origine === "exception") return "Exception" + (p.motif ? ` · ${p.motif}` : "");
  if (p.origine === "defaut") return "Par défaut";
  if (p.regleType === "weekend_alterne") return "Week-end sur deux";
  if (p.regleType === "hebdomadaire") return "Règle hebdomadaire";
  if (p.regleType === "semaines_alternees") return "Semaines alternées";
  return "Règle";
}

// "YYYY-MM-DD" -> "JJ/MM"
function jourMois(iso: string): string {
  const [, m, j] = iso.split("-");
  return j && m ? `${j}/${m}` : iso;
}

export default function PreviewCalendrierAvance({
  planning,
}: {
  planning: PlanningCalcule;
}) {
  const { periodes, conflits, vacances, joursFeries } = planning;

  return (
    <div className="space-y-4">
      {(vacances.length > 0 || joursFeries.length > 0) && (
        <div className="carte rounded-xl p-4">
          {vacances.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-texte">Vacances scolaires</p>
              <ul className="mt-1 space-y-1">
                {vacances.map((v, i) => (
                  <li key={i} className="text-sm text-texte-doux">
                    {v.nom} : du {jourMois(v.debut)} au {jourMois(v.fin)}
                    {v.zone ? ` · zone ${v.zone}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {joursFeries.length > 0 && (
            <div className={vacances.length > 0 ? "mt-3" : ""}>
              <p className="text-sm font-semibold text-texte">Jours fériés</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {joursFeries.map((f, i) => (
                  <li key={i} className="badge badge-neutre">
                    {jourMois(f.date)} · {f.nom}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {conflits.length > 0 && (
        <div className="carte rounded-xl p-4">
          <p className="text-sm font-semibold text-amber">Points à vérifier</p>
          <ul className="mt-2 space-y-1">
            {conflits.map((c, i) => (
              <li key={i} className="text-sm text-texte-doux">
                Du {dateFr(c.debut)} au {dateFr(c.fin)} : {c.details}
              </li>
            ))}
          </ul>
        </div>
      )}

      {periodes.length === 0 ? (
        <p className="rounded-lg bg-surface px-4 py-8 text-center text-texte-doux">
          Aucune période calculée sur cette plage.
        </p>
      ) : (
        <ol className="space-y-2">
          {periodes.map((p, i) => (
            <li key={i} className="carte p-4">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="text-texte">
                  Du <strong>{dateFr(p.debut)}</strong> au{" "}
                  <strong>{dateFr(p.fin)}</strong>
                </p>
                <span
                  className={
                    "badge " +
                    (p.chezQui === "moi" ? "badge-succes" : "badge-neutre")
                  }
                >
                  {p.chezQui === "moi" ? "Chez moi" : "Chez l'autre parent"}
                </span>
              </div>
              <p className="mt-1 text-xs text-texte-doux">{libelleOrigine(p)}</p>
            </li>
          ))}
        </ol>
      )}

      <p className="text-xs text-texte-doux">
        Aperçu calculé à la journée (les heures de remise seront affinées
        ultérieurement). Document d&apos;organisation, à vérifier par vous.
      </p>
    </div>
  );
}
