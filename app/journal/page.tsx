"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EncartPliable from "@/components/EncartPliable";
import FormMessage from "@/components/ui/FormMessage";
import EmptyState from "@/components/ui/EmptyState";
import OptionsAvancees from "@/components/ui/OptionsAvancees";
import ChampPieceJointe from "@/components/ChampPieceJointe";
import { getEnfantsDeProcedureActive, getProcedureActiveId } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";
import {
  CATEGORIES_IMPLICATION,
  libelleImplication,
} from "@/lib/implicationParentale";
import {
  nettoyerProposition,
  CLE_SESSION_PREREMPLISSAGE,
} from "@/lib/preRemplissage";

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
  implication_categorie: string | null;
  document_id: string | null;
};

// Vue allégée d'une pièce, pour afficher/ouvrir la pièce liée à un fait.
type DocLite = {
  id: string;
  libelle: string;
  categorie: string;
  chemin_fichier: string;
  child_id: string | null;
};

// Catégories du journal. Liste extensible : pour ajouter un type d'événement,
// ajoutez son libellé ici (et, au besoin, un texte d'aide dans AIDES_CATEGORIE).
// events.categorie est un texte libre côté base : aucune migration nécessaire.
const CATEGORIES = [
  "Remise d'enfant",
  "Santé",
  "École",
  "Communication",
  "Frais",
  "Difficulté d'exécution",
  "Décision importante",
  "Changement de situation",
  "Autre",
];

// Aide factuelle affichée sous le sélecteur quand la catégorie en a une.
// Extensible : associez un libellé de CATEGORIES à un court rappel de saisie
// (quoi dater, décrire, quelle pièce lier). Jamais de conseil juridique.
const AIDES_CATEGORIE: Record<string, string> = {
  "Difficulté d'exécution":
    "Décrivez ce qui était prévu et ce qui s'est passé : date, horaire, lieu. Liez une pièce si vous en avez une.",
  "Décision importante":
    "Notez la décision concernée et sa date. Joignez le document correspondant si vous l'avez.",
  "Changement de situation":
    "Décrivez le changement et depuis quand. Ajoutez un justificatif si possible.",
};

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
  const [implicationCategorie, setImplicationCategorie] = useState("");
  const [documentId, setDocumentId] = useState(""); // pièce liée au fait ("" = aucune)

  const [documents, setDocuments] = useState<DocLite[]>([]);
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [signalAjout, setSignalAjout] = useState(0);

  // Pré-remplissage proposé par l'assistant (lecture seule, à VÉRIFIER avant ajout).
  // preRempli ouvre le formulaire ; enfantPropose est le prénom/alias en TEXTE,
  // rapproché d'un enfant réel une fois la liste chargée ; avertissements sont
  // des notes neutres signalant une incertitude (date supposée, etc.).
  const [preRempli, setPreRempli] = useState(false);
  const [enfantPropose, setEnfantPropose] = useState<string | null>(null);
  const [avertissements, setAvertissements] = useState<string[]>([]);

  async function chargerEnfants() {
    // Enfants de la procédure active uniquement.
    const data = await getEnfantsDeProcedureActive();
    setEnfants(data);
  }

  async function chargerEvenements() {
    const { data, error } = await supabase
      .from("events")
      .select("id, titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id, statut, implication_categorie, document_id")
      .order("date_evenement", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setEvenements(data ?? []);
  }

  // Pièces actives, pour afficher/ouvrir/lier une pièce sur chaque fait.
  async function chargerDocuments() {
    const { data } = await supabase
      .from("documents")
      .select("id, libelle, categorie, chemin_fichier, child_id")
      .eq("etat", "actif")
      .order("created_at", { ascending: false });
    setDocuments((data ?? []) as DocLite[]);
  }

  useEffect(() => {
    // Chargements async (les setState surviennent après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerEnfants();
    chargerEvenements();
    chargerDocuments();
  }, []);

  // Au montage : lit UNE FOIS un éventuel pré-remplissage déposé par l'assistant,
  // puis efface la clé (usage unique). Le serveur a déjà verrouillé la sortie ;
  // on la repasse quand même par nettoyerProposition() par sécurité.
  // On n'agit que sur une proposition de type "journal".
  useEffect(() => {
    let brut: string | null = null;
    try {
      brut = sessionStorage.getItem(CLE_SESSION_PREREMPLISSAGE);
      if (brut) sessionStorage.removeItem(CLE_SESSION_PREREMPLISSAGE);
    } catch {
      return; // sessionStorage indisponible : on ignore le pré-remplissage.
    }
    if (!brut) return;

    let objet: unknown = null;
    try {
      objet = JSON.parse(brut);
    } catch {
      return;
    }

    const proposition = nettoyerProposition(objet);
    if (proposition.type !== "journal") return;

    const c = proposition.champs;
    if (c.titre !== null) setTitre(c.titre);
    setCategorie(c.categorie); // toujours une valeur sûre (liste fermée)
    if (c.date !== null) setDateEvenement(c.date);
    if (c.description !== null) setDescription(c.description);
    setEnfantPropose(c.enfant); // rapproché plus bas, une fois les enfants chargés
    setAvertissements(proposition.avertissements);
    setPreRempli(true);
  }, []);

  // Rapprochement de l'enfant proposé (TEXTE) avec un enfant réel de la procédure
  // active. Comparaison souple (espaces/majuscules ignorés). Si aucun ne
  // correspond, on laisse le champ vide : l'utilisateur choisit lui-même.
  useEffect(() => {
    if (enfantPropose === null) return;
    if (enfants.length === 0) return;
    const cible = enfantPropose.trim().toLowerCase();
    const trouve = enfants.find(
      (e) => e.prenom_ou_alias.trim().toLowerCase() === cible
    );
    if (trouve) setChildId(trouve.id);
    setEnfantPropose(null);
  }, [enfants, enfantPropose]);

  async function ajouterEvenement() {
    setMessage("");
    setConfirmation("");
    if (!titre.trim()) return setMessage("Le titre est obligatoire.");
    if (!dateEvenement) return setMessage("La date est obligatoire.");

    // Cloisonnement : chaque fait appartient directement à la procédure active.
    const procedureId = await getProcedureActiveId();
    if (!procedureId)
      return setMessage(
        "Aucune procédure active. Créez d'abord une procédure avant d'ajouter un fait."
      );

    // On n'envoie pas `statut` : la base applique son défaut « brouillon »
    // (même logique que source/valide/actif sur les tables règles).
    // implication_categorie = null si non marqué (champ facultatif).
    const { error } = await supabase.from("events").insert({
      titre: titre.trim(),
      categorie,
      date_evenement: dateEvenement,
      heure_evenement: heureEvenement || null,
      description_factuelle: description.trim() || null,
      child_id: childId || null,
      implication_categorie: implicationCategorie || null,
      document_id: documentId || null,
      procedure_id: procedureId,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setTitre(""); setCategorie("Autre"); setDateEvenement("");
      setHeureEvenement(""); setDescription(""); setChildId("");
      setImplicationCategorie(""); setDocumentId("");
      chargerDocuments(); // une pièce a pu être téléversée à la volée
      // Fin du cycle de pré-remplissage : on retire le bandeau et on referme.
      setPreRempli(false); setAvertissements([]); setEnfantPropose(null);
      setConfirmation(
        "Fait ajouté au journal. Il apparaît en brouillon dans la liste ci-dessous : vous pouvez le valider ou en ajouter un autre."
      );
      setSignalAjout((n) => n + 1);
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

  // Lier (ou délier si chaîne vide) une pièce existante à un fait.
  async function lierPiece(eventId: string, docId: string) {
    const { error } = await supabase
      .from("events")
      .update({ document_id: docId || null })
      .eq("id", eventId);
    if (error) setMessage("Erreur : " + error.message);
    else chargerEvenements();
  }

  // Ouvre la pièce liée via un lien sécurisé valable 1 minute.
  async function ouvrirPiece(docId: string) {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return setMessage("Pièce introuvable (peut-être supprimée).");
    const { data, error } = await supabase.storage
      .from("justificatifs")
      .createSignedUrl(doc.chemin_fichier, 60);
    if (error || !data) setMessage("Erreur : impossible d'ouvrir la pièce.");
    else window.open(data.signedUrl, "_blank");
  }

  // Libellé lisible d'une pièce liée (catégorie · libellé).
  function nomDocument(id: string) {
    const d = documents.find((doc) => doc.id === id);
    return d ? `${d.categorie} · ${d.libelle}` : "Pièce jointe";
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

  // Pièces de la procédure active proposables à la liaison sur un fait.
  const documentsProcedure = documents.filter(
    (d) => d.child_id === null || idsEnfantsProc.has(d.child_id)
  );

  const evenementsFiltres =
    filtreCategorie === "Toutes"
      ? evenementsProcedure
      : evenementsProcedure.filter((e) => e.categorie === filtreCategorie);

  // Export CSV de ce qui est affiché à l'écran : on repart de evenementsFiltres,
  // donc le cloisonnement par procédure active ET le filtre catégorie en cours
  // sont respectés. On n'exporte que les faits saisis par l'utilisateur, sans
  // aucune qualification ajoutée. L'avertissement non qualifié est inséré
  // automatiquement par construireCsv().
  function exporterCsv() {
    const enTete = [
      "Date",
      "Heure",
      "Catégorie",
      "Titre",
      "Description factuelle",
      "Enfant",
      "Statut",
    ];
    const lignes = evenementsFiltres.map((ev) => [
      ev.date_evenement ?? "",
      ev.heure_evenement ?? "",
      ev.categorie ?? "",
      ev.titre ?? "",
      ev.description_factuelle ?? "",
      nomEnfant(ev.child_id) ?? "",
      badgeStatut(ev.statut).texte,
    ]);
    const csv = construireCsv({
      enTete,
      lignes,
      contexte: {
        titre:
          "Journal factuel" +
          (filtreCategorie !== "Toutes" ? ` — ${filtreCategorie}` : ""),
      },
    });
    const nomFichier = `journal-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Suivi"
        title="Journal factuel"
        subtitle="Décrivez chaque événement par les faits : qui, quand, quoi."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">

        {/* Formulaire. La clé force l'ouverture de l'encart quand un
            pré-remplissage arrive (sans modifier le composant partagé). */}
        <div className="mt-8">
          <EncartPliable
            key={preRempli ? "journal-prerempli" : "journal-standard"}
            titre="Ajouter un fait"
            replieParDefaut={!preRempli}
            signalFermeture={signalAjout}
          >
            <div className="space-y-4">
          {preRempli && (
            <div className="rounded-lg border border-[#C2A24C]/50 bg-[#F8F6F1] p-3 text-sm text-[#1F2733]">
              <p className="font-medium text-[#15233F]">
                Proposition pré-remplie à partir de votre saisie.
              </p>
              <p className="mt-1 text-slate-600">
                Vérifiez chaque champ, complétez si besoin, puis cliquez sur « Ajouter au journal » pour valider vous-même l’enregistrement.
              </p>
              {avertissements.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-slate-600">
                  {avertissements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Titre <span className="text-[#9B2C2C]">*</span>
            </label>
            <input
              type="text" placeholder="Ex : Remise de l'enfant en retard"
              value={titre} onChange={(e) => setTitre(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date <span className="text-[#9B2C2C]">*</span>
              </label>
              <input
                type="date" value={dateEvenement}
                onChange={(e) => setDateEvenement(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
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

          {/* Pièce jointe facultative : téléverser ou lier une pièce existante.
              La pièce est aussi rangée dans Documents et au coffre-fort. */}
          <ChampPieceJointe
            value={documentId}
            onChange={setDocumentId}
            childId={childId || null}
            libelleDefaut={titre}
            dateDefaut={dateEvenement}
          />

          {/* Détails non indispensables au premier enregistrement.
              S'ouvrent d'office quand l'Agent a pré-rempli (clé remontée plus haut). */}
          <OptionsAvancees ouvertParDefaut={preRempli}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Catégorie</label>
                <select
                  value={categorie} onChange={(e) => setCategorie(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {AIDES_CATEGORIE[categorie] && (
                  <p className="mt-1 text-xs text-slate-500">{AIDES_CATEGORIE[categorie]}</p>
                )}
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
              <label className="block text-sm font-medium text-slate-700">
                Implication parentale (facultatif)
              </label>
              <select
                value={implicationCategorie}
                onChange={(e) => setImplicationCategorie(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">— Non concerné —</option>
                {CATEGORIES_IMPLICATION.map((c) => (
                  <option key={c.valeur} value={c.valeur}>{c.libelle}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                À renseigner si ce fait illustre une démarche concrète envers
                l&apos;enfant (rendez-vous honoré, présence à un événement…).
              </p>
            </div>
          </OptionsAvancees>

          <button
            onClick={ajouterEvenement}
            className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
          >
            Ajouter au journal
          </button>

          <FormMessage message={message} type="erreur" />
            </div>
          </EncartPliable>
        </div>

        {confirmation && (
          <div className="mt-6 rounded-lg border border-[#2E6A4D]/30 bg-[#2E6A4D]/5 px-4 py-3">
            <FormMessage message={confirmation} type="succes" />
          </div>
        )}

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

          <button
            onClick={exporterCsv}
            disabled={evenementsFiltres.length === 0}
            className="ml-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-[#15233F] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter en CSV
          </button>
        </div>

        {/* Liste */}
        <div className="mt-4 space-y-3">
          {evenementsFiltres.length === 0 && (
            <EmptyState
              titre="Aucun fait pour cette sélection"
              message={
                filtreCategorie === "Toutes"
                  ? "Ajoutez un premier fait avec « Ajouter un fait » ci-dessus."
                  : "Aucun fait dans cette catégorie. Changez de filtre ou ajoutez un fait."
              }
            />
          )}
          {evenementsFiltres.map((ev) => {
            const badge = badgeStatut(ev.statut);
            const implication = libelleImplication(ev.implication_categorie);
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
                      {implication && (
                        <span className="inline-block rounded-full border border-[#C2A24C]/40 bg-[#C2A24C]/10 px-2.5 py-0.5 text-xs text-[#8A5A12]">
                          Implication : {implication}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-semibold text-[#15233F]">{ev.titre}</p>
                    <p className="text-sm text-slate-500">
                      {ev.date_evenement}{ev.heure_evenement ? ` à ${ev.heure_evenement}` : ""}
                      {nomEnfant(ev.child_id) ? ` · ${nomEnfant(ev.child_id)}` : ""}
                    </p>
                    {ev.description_factuelle && (
                      <p className="mt-2 text-sm text-slate-700">{ev.description_factuelle}</p>
                    )}

                    {/* Pièce liée au fait (ou liaison d'une pièce existante). */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {ev.document_id ? (
                        <>
                          <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800">
                            ✓ {nomDocument(ev.document_id)}
                          </span>
                          <button
                            onClick={() => ouvrirPiece(ev.document_id!)}
                            className="text-xs text-slate-700 hover:underline"
                          >
                            Ouvrir
                          </button>
                        </>
                      ) : (
                        <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                          Sans pièce jointe
                        </span>
                      )}
                      <select
                        value={ev.document_id ?? ""}
                        onChange={(e) => lierPiece(ev.id, e.target.value)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="">— Lier une pièce —</option>
                        {documentsProcedure.map((d) => (
                          <option key={d.id} value={d.id}>{d.categorie} · {d.libelle}</option>
                        ))}
                      </select>
                    </div>
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