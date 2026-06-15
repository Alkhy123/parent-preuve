"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";

type Enfant = { id: string; prenom_ou_alias: string };

type Evenement = {
  id: string;
  titre: string;
  categorie: string;
  date_evenement: string;
  heure_evenement: string | null;
  description_factuelle: string | null;
  child_id: string | null;
  statut: string;
};

const CATEGORIES = ["Remise d'enfant", "Santé", "École", "Communication", "Frais", "Autre"];

// Mots à tonalité émotionnelle ou accusatoire — sert à SUGGÉRER, jamais à bloquer
const MOTS_SENSIBLES = [
  "toujours", "jamais", "menteur", "menteuse", "irresponsable",
  "égoïste", "nul", "incapable", "honteux", "honte", "évidemment",
];

// Apparence du badge selon le statut.
function badgeStatut(s: string) {
  if (s === "valide")
    return { texte: "Validé", classe: "border-emerald-200 bg-emerald-50 text-emerald-800" };
  if (s === "exporte")
    return { texte: "Exporté", classe: "border-slate-200 bg-slate-100 text-slate-600" };
  return { texte: "Brouillon", classe: "border-amber-200 bg-amber-50 text-amber-800" };
}

export default function JournalPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);

  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("Autre");
  const [dateEvenement, setDateEvenement] = useState("");
  const [heureEvenement, setHeureEvenement] = useState("");
  const [description, setDescription] = useState("");
  const [childId, setChildId] = useState("");

  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [message, setMessage] = useState("");

  async function chargerEnfants() {
    // Enfants de la procédure active uniquement.
    const data = await getEnfantsDeProcedureActive();
    setEnfants(data);
  }

  async function chargerEvenements() {
    const { data, error } = await supabase
      .from("events")
      .select("id, titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id, statut")
      .order("date_evenement", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setEvenements(data ?? []);
  }

  useEffect(() => {
    chargerEnfants();
    chargerEvenements();
  }, []);

  async function ajouterEvenement() {
    setMessage("");
    if (!titre.trim()) return setMessage("Le titre est obligatoire.");
    if (!dateEvenement) return setMessage("La date est obligatoire.");

    // On n'envoie pas `statut` : la base applique son défaut « brouillon »
    // (même logique que source/valide/actif sur les tables règles).
    const { error } = await supabase.from("events").insert({
      titre: titre.trim(),
      categorie,
      date_evenement: dateEvenement,
      heure_evenement: heureEvenement || null,
      description_factuelle: description.trim() || null,
      child_id: childId || null,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setTitre(""); setCategorie("Autre"); setDateEvenement("");
      setHeureEvenement(""); setDescription(""); setChildId("");
      chargerEvenements();
    }
  }

  // Fait passer un événement de brouillon à validé (et inversement).
  async function changerStatut(id: string, nouveau: "brouillon" | "valide") {
    const { error } = await supabase.from("events").update({ statut: nouveau }).eq("id", id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerEvenements();
  }

  async function supprimerEvenement(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerEvenements();
  }

  function nomEnfant(id: string | null) {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  // Garde-fou neutralité : on repère une tonalité non factuelle (sans bloquer)
  const texte = (titre + " " + description).toLowerCase();
  const motsDetectes = MOTS_SENSIBLES.filter((mot) => texte.includes(mot));

  // Filtrage par procédure active : on garde les événements d'un enfant de la
  // procédure active, plus ceux sans enfant rattaché (généraux).
  const idsEnfantsProc = new Set(enfants.map((e) => e.id));
  const evenementsProcedure = evenements.filter(
    (e) => e.child_id === null || idsEnfantsProc.has(e.child_id)
  );

  const evenementsFiltres =
    filtreCategorie === "Toutes"
      ? evenementsProcedure
      : evenementsProcedure.filter((e) => e.categorie === filtreCategorie);

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Suivi"
        title="Journal factuel"
        subtitle="Décrivez chaque événement par les faits : qui, quand, quoi."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">

        {/* Formulaire */}
        <div className="mt-8 carte rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Titre</label>
            <input
              type="text" placeholder="Ex : Remise de l'enfant en retard"
              value={titre} onChange={(e) => setTitre(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4>"
            <div>
              <label className="block text-sm font-medium text-slate-700">Catégorie</label>
              <select
                value={categorie} onChange={(e) => setCategorie(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Enfant concerné</label>
              <select
                value={childId} onChange={(e) => setChildId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">— Aucun —</option>
                {enfants.map((e) => (
                  <option key={e.id} value={e.id}>{e.prenom_ou_alias}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date" value={dateEvenement}
                onChange={(e) => setDateEvenement(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Heure (facultatif)</label>
              <input
                type="time" value={heureEvenement}
                onChange={(e) => setHeureEvenement(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description factuelle</label>
            <textarea
              rows={3} placeholder="Décrivez les faits observables, sans interprétation."
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          {motsDetectes.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Astuce neutralité : votre texte contient des termes peu factuels
              ({motsDetectes.join(", ")}). Préférez décrire ce qui est observable
              (horaires, paroles exactes, faits) plutôt qu&apos;une interprétation.
            </div>
          )}

          <button
            onClick={ajouterEvenement}
            className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
          >
            Ajouter au journal
          </button>

          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>

        {/* Filtre */}
        <div className="mt-8 flex items-center gap-3">
          <label className="text-sm text-slate-600">Filtrer :</label>
          <select
            value={filtreCategorie} onChange={(e) => setFiltreCategorie(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="Toutes">Toutes les catégories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Liste */}
        <div className="mt-4 space-y-3">
          {evenementsFiltres.length === 0 && (
            <p className="text-slate-500">Aucun événement pour cette sélection.</p>
          )}
          {evenementsFiltres.map((ev) => {
            const badge = badgeStatut(ev.statut);
            return (
              <div key={ev.id} className="carte rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                        {ev.categorie}
                      </span>
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${badge.classe}`}>
                        {badge.texte}
                      </span>
                    </div>
                    <p className="mt-1.5 font-semibold text-[#15233F]">{ev.titre}</p>
                    <p className="text-sm text-slate-500">
                      {ev.date_evenement}{ev.heure_evenement ? ` à ${ev.heure_evenement}` : ""}
                      {nomEnfant(ev.child_id) ? ` · ${nomEnfant(ev.child_id)}` : ""}
                    </p>
                    {ev.description_factuelle && (
                      <p className="mt-2 text-sm text-slate-700">{ev.description_factuelle}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {ev.statut !== "valide" && (
                      <button
                        onClick={() => changerStatut(ev.id, "valide")}
                        className="rounded-lg border border-emerald-300 px-3 py-1 text-sm text-emerald-700 hover:bg-emerald-50"
                      >
                        Marquer comme validé
                      </button>
                    )}
                    {ev.statut !== "brouillon" && (
                      <button
                        onClick={() => changerStatut(ev.id, "brouillon")}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        Repasser en brouillon
                      </button>
                    )}
                    <button
                      onClick={() => supprimerEvenement(ev.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
