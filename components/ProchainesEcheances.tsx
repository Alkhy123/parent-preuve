"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { echeancesAVenir, type Echeance } from "@/lib/gardeNotifications";
import type { RegleGarde } from "@/lib/gardeCalendrier";




const SEUIL_NOTIF_JOURS = 2; // on prévient quand la garde est dans 2 jours ou moins

export default function ProchainesEcheances() {
  const [echeances, setEcheances] = useState<Echeance[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);

    (async () => {
      const { data } = await supabase
        .from("garde_regles")
        .select("*, children(prenom_ou_alias)")
        .eq("actif", true);

      if (data) {
        const regles = data.map((r: any) => ({
          regle: {
            type_garde: r.type_garde,
            parent_principal: r.parent_principal,
            date_reference: r.date_reference,
            jour_debut: r.jour_debut,
            heure_debut: (r.heure_debut || "18:00").slice(0, 5),
            jour_fin: r.jour_fin,
            heure_fin: (r.heure_fin || "18:00").slice(0, 5),
          } as RegleGarde,
          enfantId: r.enfant_id,
          enfantNom: r.children?.prenom_ou_alias ?? "Enfant",
        }));
        setEcheances(echeancesAVenir(regles, 30));
      }
      setChargement(false);
    })();
  }, []);

  // Notifications navigateur pour MES gardes toutes proches (une seule fois chacune)
  useEffect(() => {
    if (permission !== "granted") return;
    for (const e of echeances) {
      if (e.chezQui !== "moi" || e.joursRestants > SEUIL_NOTIF_JOURS) continue;
      const cle = "notif-garde:" + e.enfantId + ":" + e.debut.toISOString();
      if (localStorage.getItem(cle)) continue; // déjà notifié
      try {
        new Notification("Garde à venir", {
          body:
            "Garde de " + e.enfantNom + " le " +
            e.debut.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) +
            " à " + e.debut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) +
            (e.joursRestants <= 0 ? " (aujourd'hui)" : " (dans " + e.joursRestants + " j)"),
        });
        localStorage.setItem(cle, "1");
      } catch {
        // certaines plateformes (mobile) exigent un service worker : on ignore sans planter
      }
    }
  }, [echeances, permission]);

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

  return (
    <section className="carte rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-display text-xl text-[#15233F]">Prochaines échéances de garde</h2>
        {permission !== "granted" && (
          <button
            onClick={activerRappels}
            className="rounded-md border border-[#15233F] px-3 py-1.5 text-sm text-[#15233F] hover:bg-[#15233F] hover:text-white"
          >
            Activer les rappels
          </button>
        )}
      </div>

      {permission === "granted" && (
        <p className="text-xs text-gray-500 mb-3">
          Rappels activés. Tu seras averti quand une garde approche, lorsque l'app est ouverte dans ce navigateur.
        </p>
      )}

      {chargement ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : echeances.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucune garde à venir dans les 30 prochains jours. Vérifie qu'une règle est enregistrée dans le calendrier.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {echeances.map((e, i) => (
            <li key={i} className="py-3 flex items-center gap-3">
              <span
                className={
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md " +
                  (e.chezQui === "moi" ? "bg-[#C2A24C]/15" : "bg-gray-100")
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: e.chezQui === "moi" ? "#C2A24C" : "#9CA3AF" }}
                />
              </span>
              <div className="flex-1 text-[#1F2733]">
                <span className="font-medium">{e.enfantNom}</span> — {fmt(e.debut)} {fmtHeure(e.debut)}
                <span className="block text-xs text-gray-500">
                  {e.chezQui === "moi" ? "Garde chez moi" : "Garde chez l'autre parent"}
                </span>
              </div>
              <span
                className={
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium " +
                  (e.joursRestants <= SEUIL_NOTIF_JOURS && e.chezQui === "moi"
                    ? "bg-[#C2A24C] text-white"
                    : "bg-gray-100 text-gray-600")
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