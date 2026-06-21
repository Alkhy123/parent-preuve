"use client";

// components/onboarding/EtapeCalendrier.tsx
//
// Etape 7 : calendrier de garde (un week-end sur deux), par enfant de la
// procedure active. Reutilise le moteur existant (lib/gardeCalendrier) pour
// l'apercu et ecrit dans la table `garde_regles`, exactement comme la page
// /calendrier. Pas de calendrier avance ici (bloc 07).

import { useEffect, useState } from "react";
import PiedEtape, { type EtapeProps } from "@/components/onboarding/PiedEtape";
import { supabase } from "@/lib/supabase";
import {
  getEnfantsDeProcedureActive,
  getProcedureActiveId,
} from "@/lib/procedureActive";
import { prochainsWeekends, JOURS, type RegleGarde } from "@/lib/gardeCalendrier";

type Enfant = { id: string; prenom_ou_alias: string };

// Categorie d'evenement reservee aux visites mediatisees planifiees (table events).
const CATEGORIE_VISITE = "visite_mediatisee";

type Visite = {
  id: string;
  date_evenement: string;
  heure_evenement: string | null;
  description_factuelle: string | null;
};

const champCss =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-texte focus:border-[#C2A24C] focus:outline-none focus:ring-1 focus:ring-[#C2A24C]";
const labelCss = "text-sm font-medium text-navy";

export default function EtapeCalendrier({
  onContinuer,
  onPrecedent,
  estPremiere,
  estDerniere,
}: EtapeProps) {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [enfantId, setEnfantId] = useState("");
  const [regleId, setRegleId] = useState<string | null>(null);

  const [parentPrincipal, setParentPrincipal] = useState<"moi" | "autre">("autre");
  const [dateReference, setDateReference] = useState("");
  const [jourDebut, setJourDebut] = useState(5);
  const [heureDebut, setHeureDebut] = useState("18:00");
  const [jourFin, setJourFin] = useState(7);
  const [heureFin, setHeureFin] = useState("18:00");
  const [notes, setNotes] = useState("");

  const [chargement, setChargement] = useState(true);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState("");

  // Visites mediatisees (calendrier saisi a la main, stocke dans `events`).
  const [mediatise, setMediatise] = useState(false);
  const [aCalendrier, setACalendrier] = useState<"oui" | "non" | null>(null);
  const [visites, setVisites] = useState<Visite[]>([]);
  const [vDate, setVDate] = useState("");
  const [vDebut, setVDebut] = useState("");
  const [vFin, setVFin] = useState("");
  const [vLieu, setVLieu] = useState("");
  const [vNotes, setVNotes] = useState("");
  const [vOccupe, setVOccupe] = useState(false);
  const [vMessage, setVMessage] = useState("");

  // 1) enfants de la procedure active + nature du DVH (mediatise ?)
  useEffect(() => {
    let annule = false;
    (async () => {
      const data = await getEnfantsDeProcedureActive();
      if (annule) return;
      setEnfants(data);
      if (data.length > 0) setEnfantId(data[0].id);

      const procId = await getProcedureActiveId();
      if (procId) {
        const { data: dvh } = await supabase
          .from("dvh_regle")
          .select("type_dvh")
          .eq("procedure_id", procId)
          .eq("actif", true)
          .maybeSingle();
        if (!annule && dvh?.type_dvh === "mediatise") setMediatise(true);
      }
      if (!annule) setChargement(false);
    })();
    return () => {
      annule = true;
    };
  }, []);

  // Visites mediatisees deja enregistrees pour l'enfant courant.
  useEffect(() => {
    let annule = false;
    Promise.resolve().then(async () => {
      if (annule) return;
      if (!mediatise || !enfantId) {
        setVisites([]);
        return;
      }
      const { data } = await supabase
        .from("events")
        .select("id, date_evenement, heure_evenement, description_factuelle")
        .eq("categorie", CATEGORIE_VISITE)
        .eq("child_id", enfantId)
        .order("date_evenement", { ascending: true });
      if (!annule) setVisites((data ?? []) as Visite[]);
    });
    return () => {
      annule = true;
    };
  }, [mediatise, enfantId]);

  // 2) charger la regle de l'enfant (ou remettre les defauts)
  useEffect(() => {
    if (!enfantId) return;
    let annule = false;
    (async () => {
      const { data } = await supabase
        .from("garde_regles")
        .select("*")
        .eq("enfant_id", enfantId)
        .eq("actif", true)
        .maybeSingle();
      if (annule) return;
      if (data) {
        setRegleId(data.id);
        setParentPrincipal(data.parent_principal);
        setDateReference(data.date_reference);
        setJourDebut(data.jour_debut);
        setHeureDebut((data.heure_debut || "18:00").slice(0, 5));
        setJourFin(data.jour_fin);
        setHeureFin((data.heure_fin || "18:00").slice(0, 5));
        setNotes(data.notes || "");
      } else {
        setRegleId(null);
        setParentPrincipal("autre");
        setDateReference("");
        setJourDebut(5);
        setHeureDebut("18:00");
        setJourFin(7);
        setHeureFin("18:00");
        setNotes("");
      }
      setMessage("");
    })();
    return () => {
      annule = true;
    };
  }, [enfantId]);

  async function enregistrer() {
    if (!enfantId) return setMessage("Choisissez d'abord un enfant.");
    if (!dateReference) return setMessage("Indiquez une date de référence.");

    setOccupe(true);
    const valeurs = {
      enfant_id: enfantId,
      type_garde: "weekend_sur_deux",
      parent_principal: parentPrincipal,
      date_reference: dateReference,
      jour_debut: jourDebut,
      heure_debut: heureDebut,
      jour_fin: jourFin,
      heure_fin: heureFin,
      notes: notes || null,
      source: "manuel",
      valide: true,
      actif: true,
    };

    let erreur;
    if (regleId) {
      ({ error: erreur } = await supabase
        .from("garde_regles")
        .update(valeurs)
        .eq("id", regleId));
    } else {
      const { data, error } = await supabase
        .from("garde_regles")
        .insert(valeurs)
        .select("id")
        .single();
      erreur = error;
      if (data) setRegleId(data.id);
    }

    setOccupe(false);
    setMessage(erreur ? "Erreur : " + erreur.message : "Règle enregistrée ✓");
  }

  async function rafraichirVisites() {
    if (!enfantId) return;
    const { data } = await supabase
      .from("events")
      .select("id, date_evenement, heure_evenement, description_factuelle")
      .eq("categorie", CATEGORIE_VISITE)
      .eq("child_id", enfantId)
      .order("date_evenement", { ascending: true });
    setVisites((data ?? []) as Visite[]);
  }

  async function ajouterVisite() {
    setVMessage("");
    if (!enfantId) return setVMessage("Choisissez d'abord un enfant.");
    if (!vDate) return setVMessage("Indiquez au moins la date de la visite.");

    // Description factuelle : creneau + lieu + notes, sans qualification.
    const morceaux = [
      vDebut && vFin ? `De ${vDebut} à ${vFin}` : vDebut ? `À ${vDebut}` : null,
      vLieu ? `Lieu : ${vLieu}` : null,
      vNotes || null,
    ].filter(Boolean);

    setVOccupe(true);
    const { error } = await supabase.from("events").insert({
      child_id: enfantId,
      titre: "Visite médiatisée",
      categorie: CATEGORIE_VISITE,
      date_evenement: vDate,
      heure_evenement: vDebut || null,
      description_factuelle: morceaux.length > 0 ? morceaux.join(" · ") : null,
      statut: "valide",
    });
    setVOccupe(false);
    if (error) {
      setVMessage("Erreur : " + error.message);
      return;
    }
    setVDate("");
    setVDebut("");
    setVFin("");
    setVLieu("");
    setVNotes("");
    await rafraichirVisites();
  }

  async function supprimerVisite(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      setVMessage("Erreur : " + error.message);
      return;
    }
    await rafraichirVisites();
  }

  const regleCourante: RegleGarde | null = dateReference
    ? {
        type_garde: "weekend_sur_deux",
        parent_principal: parentPrincipal,
        date_reference: dateReference,
        jour_debut: jourDebut,
        heure_debut: heureDebut,
        jour_fin: jourFin,
        heure_fin: heureFin,
      }
    : null;

  const apercu = regleCourante ? prochainsWeekends(regleCourante, 4) : [];
  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  if (chargement) {
    return <p className="text-sm text-texte-doux">Chargement…</p>;
  }

  if (enfants.length === 0) {
    return (
      <div>
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aucun enfant dans la procédure active. Revenez à l&apos;étape « Enfants » pour
          en ajouter, ou continuez : vous pourrez renseigner le calendrier plus tard.
        </div>
        <PiedEtape
          onPrecedent={onPrecedent}
          estPremiere={estPremiere}
          onContinuer={onContinuer}
          libelleContinuer={
            estDerniere ? "Accéder à mon tableau de bord" : "Continuer"
          }
        />
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-texte-doux">
        Enregistrez la règle « un week-end sur deux » pour chaque enfant. Vous pourrez
        l&apos;ajuster plus tard depuis « Calendrier de garde ».
      </p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className={labelCss}>Enfant</span>
          <select
            value={enfantId}
            onChange={(e) => setEnfantId(e.target.value)}
            className={champCss}
          >
            {enfants.map((en) => (
              <option key={en.id} value={en.id}>
                {en.prenom_ou_alias}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelCss}>Chez qui l&apos;enfant vit-il principalement ?</span>
          <select
            value={parentPrincipal}
            onChange={(e) => setParentPrincipal(e.target.value as "moi" | "autre")}
            className={champCss}
          >
            <option value="autre">Chez l&apos;autre parent (j&apos;ai le DVH)</option>
            <option value="moi">Chez moi (l&apos;autre parent a le DVH)</option>
          </select>
        </label>

        <label className="block">
          <span className={labelCss}>Date de référence (un week-end de garde connu)</span>
          <input
            type="date"
            value={dateReference}
            onChange={(e) => setDateReference(e.target.value)}
            className={champCss}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCss}>Début — jour</span>
            <select
              value={jourDebut}
              onChange={(e) => setJourDebut(Number(e.target.value))}
              className={champCss}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <option key={j} value={j}>
                  {JOURS[j]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCss}>Début — heure</span>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className={champCss}
            />
          </label>
          <label className="block">
            <span className={labelCss}>Fin — jour</span>
            <select
              value={jourFin}
              onChange={(e) => setJourFin(Number(e.target.value))}
              className={champCss}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <option key={j} value={j}>
                  {JOURS[j]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCss}>Fin — heure</span>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className={champCss}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelCss}>Notes (facultatif)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={champCss}
          />
        </label>

        <button
          type="button"
          onClick={enregistrer}
          disabled={occupe}
          className="btn btn-secondaire disabled:opacity-50"
        >
          {occupe ? "Enregistrement…" : "Enregistrer la règle"}
        </button>

        {message && <p className="text-sm text-texte">{message}</p>}
      </div>

      {apercu.length > 0 && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-display text-base text-navy">Prochains week-ends</h3>
          <ul className="mt-2 space-y-1 text-sm text-texte">
            {apercu.map((p, i) => (
              <li key={i}>
                Du {fmt(p.debut)} au {fmt(p.fin)} —{" "}
                {p.chezQui === "moi" ? "chez moi" : "chez l'autre parent"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visites mediatisees : le jugement ne fixe pas le calendrier, il est
          convenu avec le centre de visite. L'utilisateur peut le saisir ici. */}
      {mediatise && (
        <div className="mt-6 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-4">
          <h3 className="font-display text-base text-navy">Visites médiatisées</h3>
          <p className="mt-1 text-sm text-texte-doux">
            Le droit de visite est médiatisé : le jugement ne fixe pas de calendrier,
            il est convenu avec le centre de visite. Avez-vous déjà un calendrier de
            visite prévu ?
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setACalendrier("oui")}
              className={[
                "btn",
                aCalendrier === "oui" ? "btn-primaire" : "btn-secondaire",
              ].join(" ")}
            >
              Oui
            </button>
            <button
              type="button"
              onClick={() => setACalendrier("non")}
              className={[
                "btn",
                aCalendrier === "non" ? "btn-primaire" : "btn-secondaire",
              ].join(" ")}
            >
              Pas encore
            </button>
          </div>

          {aCalendrier === "non" && (
            <p className="mt-3 text-sm text-texte-doux">
              Pas de souci. Vous pourrez ajouter les dates de visite ici dès que le
              centre vous les aura communiquées.
            </p>
          )}

          {aCalendrier === "oui" && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelCss}>Date de la visite</span>
                  <input
                    type="date"
                    value={vDate}
                    onChange={(e) => setVDate(e.target.value)}
                    className={champCss}
                  />
                </label>
                <label className="block">
                  <span className={labelCss}>Lieu (centre de visite)</span>
                  <input
                    type="text"
                    value={vLieu}
                    onChange={(e) => setVLieu(e.target.value)}
                    placeholder="Ex : espace rencontre…"
                    className={champCss}
                  />
                </label>
                <label className="block">
                  <span className={labelCss}>Heure de début</span>
                  <input
                    type="time"
                    value={vDebut}
                    onChange={(e) => setVDebut(e.target.value)}
                    className={champCss}
                  />
                </label>
                <label className="block">
                  <span className={labelCss}>Heure de fin</span>
                  <input
                    type="time"
                    value={vFin}
                    onChange={(e) => setVFin(e.target.value)}
                    className={champCss}
                  />
                </label>
              </div>
              <label className="block">
                <span className={labelCss}>Notes (facultatif)</span>
                <textarea
                  value={vNotes}
                  onChange={(e) => setVNotes(e.target.value)}
                  rows={2}
                  className={champCss}
                />
              </label>

              <button
                type="button"
                onClick={ajouterVisite}
                disabled={vOccupe || vDate === ""}
                className="btn btn-secondaire disabled:opacity-50"
              >
                {vOccupe ? "Ajout…" : "Ajouter cette visite"}
              </button>

              {vMessage && <p className="text-sm text-texte">{vMessage}</p>}

              <ul className="space-y-2">
                {visites.length === 0 ? (
                  <li className="text-sm text-texte-doux">
                    Aucune visite enregistrée pour cet enfant.
                  </li>
                ) : (
                  visites.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
                    >
                      <span className="text-texte">
                        {v.date_evenement}
                        {v.description_factuelle ? ` — ${v.description_factuelle}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => supprimerVisite(v.id)}
                        className="text-sm text-rouge hover:underline"
                      >
                        Retirer
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <PiedEtape
        onPrecedent={onPrecedent}
        estPremiere={estPremiere}
        onContinuer={onContinuer}
        libelleContinuer={estDerniere ? "Accéder à mon tableau de bord" : "Continuer"}
      />
    </div>
  );
}
