"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { echeancesAVenir } from "@/lib/gardeNotifications";
import type { RegleGarde } from "@/lib/gardeCalendrier";

const SEUIL_NOTIF_JOURS = 2; // on prévient quand l'échéance est dans 2 jours ou moins
const FENETRE_JOURS = 30;

// Element unifie affiche dans la liste : garde (week-end) ou visite mediatisee.
type Item = {
  debut: Date;
  enfantId: string;
  enfantNom: string;
  joursRestants: number;
  type: "garde" | "visite";
  chezQui: "moi" | "autre";
};

// Formes minimales des lignes lues (le client Supabase n'est pas typé).
type RegleRow = {
  enfant_id: string | null;
  type_garde: string;
  parent_principal: "moi" | "autre";
  date_reference: string;
  jour_debut: number;
  heure_debut: string | null;
  jour_fin: number;
  heure_fin: string | null;
  children: unknown; // jointure : objet au runtime, typee largement par Supabase
};
type VisiteRow = {
  date_evenement: string;
  heure_evenement: string | null;
  child_id: string | null;
  children: unknown;
};

// La jointure children peut etre un objet (to-one) ou un tableau selon l'inference.
function nomEnfant(children: unknown): string {
  if (!children) return "Enfant";
  const c = Array.isArray(children) ? children[0] : children;
  return (c as { prenom_ou_alias?: string } | null)?.prenom_ou_alias ?? "Enfant";
}

function debutDeJour(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

// "YYYY-MM-DD" (+ "HH:MM[:SS]" optionnel) -> Date locale.
function dateHeure(dateStr: string, heure: string | null): Date {
  const [a, m, j] = dateStr.split("-").map(Number);
  const [h, min] = (heure ?? "10:00").slice(0, 5).split(":").map(Number);
  return new Date(a, m - 1, j, h || 0, min || 0, 0, 0);
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function ProchainesEcheances() {
  const [items, setItems] = useState<Item[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      const procId = await getProcedureActiveId();
      if (annule) return;
      if ("Notification" in window) setPermission(Notification.permission);

      // Enfants de la procédure active.
      let idsProc = new Set<string>();
      if (procId) {
        const { data: enfantsRows } = await supabase
          .from("children")
          .select("id")
          .eq("procedure_id", procId);
        idsProc = new Set((enfantsRows ?? []).map((e) => e.id));
      }

      const liste: Item[] = [];

      // 1) Gardes (week-end sur deux) issues de garde_regles.
      const { data: reglesData } = await supabase
        .from("garde_regles")
        .select("*, children(prenom_ou_alias)")
        .eq("actif", true);

      if (reglesData) {
        const regles = (reglesData as RegleRow[])
          .filter((r) => r.enfant_id && idsProc.has(r.enfant_id))
          .map((r) => ({
            regle: {
              type_garde: r.type_garde,
              parent_principal: r.parent_principal,
              date_reference: r.date_reference,
              jour_debut: r.jour_debut,
              heure_debut: (r.heure_debut || "18:00").slice(0, 5),
              jour_fin: r.jour_fin,
              heure_fin: (r.heure_fin || "18:00").slice(0, 5),
            } as RegleGarde,
            enfantId: r.enfant_id as string,
            enfantNom: nomEnfant(r.children),
          }));
        for (const e of echeancesAVenir(regles, FENETRE_JOURS)) {
          liste.push({
            debut: e.debut,
            enfantId: e.enfantId,
            enfantNom: e.enfantNom,
            joursRestants: e.joursRestants,
            type: "garde",
            chezQui: e.chezQui,
          });
        }
      }

      // 2) Visites médiatisées planifiées (events, categorie visite_mediatisee).
      const now = new Date();
      const fin = new Date();
      fin.setDate(fin.getDate() + FENETRE_JOURS);
      const { data: visitesData } = procId
        ? await supabase
            .from("events")
            .select("date_evenement, heure_evenement, child_id, children(prenom_ou_alias)")
            .eq("procedure_id", procId)
            .eq("categorie", "visite_mediatisee")
            .eq("statut", "valide")
            .gte("date_evenement", isoDate(now))
            .lte("date_evenement", isoDate(fin))
        : { data: null };

      if (visitesData) {
        for (const v of visitesData as VisiteRow[]) {
          // Cloisonnement principal : procedure_id (filtre en base ci-dessus).
          // Le filtre enfant reste un garde-fou secondaire d'affichage.
          if (!v.child_id || !idsProc.has(v.child_id)) continue;
          const debut = dateHeure(v.date_evenement, v.heure_evenement);
          const jours = Math.ceil(
            (debutDeJour(debut).getTime() - debutDeJour(now).getTime()) / 86400000
          );
          if (jours < 0) continue;
          liste.push({
            debut,
            enfantId: v.child_id,
            enfantNom: nomEnfant(v.children),
            joursRestants: jours,
            type: "visite",
            chezQui: "moi",
          });
        }
      }

      liste.sort((a, b) => a.debut.getTime() - b.debut.getTime());
      if (annule) return;
      setItems(liste);
      setChargement(false);
    })();
    return () => {
      annule = true;
    };
  }, []);

  // Notifications navigateur pour les échéances toutes proches (une seule fois chacune).
  useEffect(() => {
    if (permission !== "granted") return;
    for (const e of items) {
      if (e.joursRestants > SEUIL_NOTIF_JOURS) continue;
      if (e.type === "garde" && e.chezQui !== "moi") continue;
      const cle =
        "notif-" + e.type + ":" + e.enfantId + ":" + e.debut.toISOString();
      if (localStorage.getItem(cle)) continue; // déjà notifié
      try {
        const quand =
          e.debut.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }) +
          (e.joursRestants <= 0 ? " (aujourd'hui)" : " (dans " + e.joursRestants + " j)");
        new Notification(e.type === "visite" ? "Visite à venir" : "Garde à venir", {
          body:
            (e.type === "visite" ? "Visite médiatisée de " : "Garde de ") +
            e.enfantNom +
            " le " +
            quand,
        });
        localStorage.setItem(cle, "1");
      } catch {
        // certaines plateformes (mobile) exigent un service worker : on ignore sans planter
      }
    }
  }, [items, permission]);

  async function activerRappels() {
    if (!("Notification" in window)) return;
    setPermission(await Notification.requestPermission());
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const fmtHeure = (d: Date) =>
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const badge = (j: number) =>
    j <= 0 ? "Aujourd'hui" : j === 1 ? "Demain" : "Dans " + j + " jours";

  function sousTitre(e: Item): string {
    if (e.type === "visite") return "Visite médiatisée";
    return e.chezQui === "moi" ? "Garde chez moi" : "Garde chez l'autre parent";
  }
  function pastille(e: Item): string {
    // Visite et garde "chez moi" : accent or ; garde chez l'autre : gris.
    return e.type === "visite" || e.chezQui === "moi" ? "#C2A24C" : "#5A6473";
  }

  return (
    <section className="carte rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-display text-xl text-[#15233F]">Prochaines échéances</h2>
        {permission !== "granted" && (
          <button onClick={activerRappels} className="btn btn-secondaire">
            Activer les rappels
          </button>
        )}
      </div>

      {permission === "granted" && (
        <p className="text-xs text-texte-doux mb-3">
          Rappels activés. Tu seras averti quand une échéance approche, lorsque l&apos;app
          est ouverte dans ce navigateur.
        </p>
      )}

      {chargement ? (
        <p className="text-sm text-texte-doux">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-texte-doux">
          Aucune échéance à venir dans les {FENETRE_JOURS} prochains jours. Vérifie
          qu&apos;une règle de garde ou des visites sont enregistrées dans le calendrier.
        </p>
      ) : (
        <ul className="divide-y divide-[#15233F]/10">
          {items.map((e, i) => (
            <li key={i} className="py-3 flex items-center gap-3">
              <span
                className={
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md " +
                  (e.type === "visite" || e.chezQui === "moi"
                    ? "bg-[#C2A24C]/15"
                    : "bg-[#15233F]/5")
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: pastille(e) }}
                />
              </span>
              <div className="flex-1 text-[#1F2733]">
                <span className="font-medium">{e.enfantNom}</span> — {fmt(e.debut)}{" "}
                {fmtHeure(e.debut)}
                <span className="block text-xs text-texte-doux">{sousTitre(e)}</span>
              </div>
              <span
                className={
                  "badge shrink-0 " +
                  (e.joursRestants <= SEUIL_NOTIF_JOURS &&
                  (e.type === "visite" || e.chezQui === "moi")
                    ? "border-transparent bg-[#C2A24C] text-white"
                    : "badge-neutre")
                }
              >
                {badge(e.joursRestants)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
