"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EncartPliable from "@/components/EncartPliable";
import { euros } from "@/lib/dossierCalculs";
import RegleFrais from '@/components/RegleFrais';
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";
import {
  nettoyerProposition,
  CLE_SESSION_PREREMPLISSAGE,
} from "@/lib/preRemplissage";

type Enfant = { id: string; prenom_ou_alias: string };

// Vue allégée d'un document, pour le proposer comme justificatif.
type DocLite = {
  id: string;
  libelle: string;
  categorie: string;
  chemin_fichier: string;
  childId: string | null;
};

type Frais = {
  id: string;
  libelle: string;
  categorie: string;
  montant: number;
  part_autre: number;
  date_frais: string;
  rembourse: boolean;
  child_id: string | null;
  document_id: string | null;
};

const CATEGORIES = ["Santé", "École", "Activités", "Vêtements", "Garde", "Autre"];

export default function FraisPage() {
  const [frais, setFrais] = useState<Frais[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [documents, setDocuments] = useState<DocLite[]>([]);

  const [libelle, setLibelle] = useState("");
  const [categorie, setCategorie] = useState("Autre");
  const [montant, setMontant] = useState("");
  const [partAutre, setPartAutre] = useState("");
  const [dateFrais, setDateFrais] = useState("");
  const [childId, setChildId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [message, setMessage] = useState("");
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

  async function chargerDocuments() {
    const { data } = await supabase
      .from("documents")
      .select("id, libelle, categorie, chemin_fichier, child_id")
      .order("created_at", { ascending: false });
    setDocuments(
      (data ?? []).map((d) => ({
        id: d.id,
        libelle: d.libelle,
        categorie: d.categorie,
        chemin_fichier: d.chemin_fichier,
        childId: d.child_id,
      }))
    );
  }

  async function chargerFrais() {
    const { data, error } = await supabase
      .from("expenses")
      .select("id, libelle, categorie, montant, part_autre, date_frais, rembourse, child_id, document_id")
      .order("date_frais", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setFrais(data ?? []);
  }

  useEffect(() => {
    chargerEnfants();
    chargerDocuments();
    chargerFrais();
  }, []);

  // Au montage : lit UNE FOIS un éventuel pré-remplissage déposé par l'assistant,
  // puis efface la clé (usage unique). Le serveur a déjà verrouillé la sortie ;
  // on la repasse quand même par nettoyerProposition() par sécurité.
  // On n'agit que sur une proposition de type "frais".
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
    if (proposition.type !== "frais") return;

    const c = proposition.champs;
    if (c.libelle !== null) setLibelle(c.libelle);
    setCategorie(c.categorie); // toujours une valeur sûre (liste fermée)
    if (c.montant !== null) setMontant(String(c.montant));
    if (c.date !== null) setDateFrais(c.date);
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

  async function ajouterFrais() {
    setMessage("");
    if (!libelle.trim()) return setMessage("Le libellé est obligatoire.");
    if (!dateFrais) return setMessage("La date est obligatoire.");
    const montantNum = parseFloat(montant.replace(",", "."));
    if (isNaN(montantNum)) return setMessage("Le montant doit être un nombre.");

    // Si la part de l'autre n'est pas saisie, on propose la moitié par défaut
    const partNum = partAutre.trim()
      ? parseFloat(partAutre.replace(",", "."))
      : montantNum / 2;

    const { error } = await supabase.from("expenses").insert({
      libelle: libelle.trim(),
      categorie,
      montant: montantNum,
      part_autre: isNaN(partNum) ? 0 : partNum,
      date_frais: dateFrais,
      child_id: childId || null,
      document_id: documentId || null,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setLibelle(""); setCategorie("Autre"); setMontant("");
      setPartAutre(""); setDateFrais(""); setChildId(""); setDocumentId("");
      // Fin du cycle de pré-remplissage : on retire le bandeau et on referme.
      setPreRempli(false); setAvertissements([]); setEnfantPropose(null);
      setSignalAjout((n) => n + 1);
      chargerFrais();
    }
  }

  // Lier (ou délier si chaîne vide) un justificatif à un frais existant.
  async function lierJustificatif(fraisId: string, docId: string) {
    const { error } = await supabase
      .from("expenses")
      .update({ document_id: docId || null })
      .eq("id", fraisId);
    if (error) setMessage("Erreur : " + error.message);
    else chargerFrais();
  }

  // Ouvre le justificatif lié via un lien sécurisé valable 1 minute.
  async function ouvrirJustificatif(docId: string) {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return setMessage("Justificatif introuvable (peut-être supprimé).");
    const { data, error } = await supabase.storage
      .from("justificatifs")
      .createSignedUrl(doc.chemin_fichier, 60);
    if (error || !data) setMessage("Erreur : impossible d'ouvrir le justificatif.");
    else window.open(data.signedUrl, "_blank");
  }

  async function basculerRembourse(f: Frais) {
    const { error } = await supabase
      .from("expenses")
      .update({ rembourse: !f.rembourse })
      .eq("id", f.id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerFrais();
  }

  async function supprimerFrais(id: string) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerFrais();
  }

  function nomEnfant(id: string | null) {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  // Filtrage par procédure active (frais/justificatifs d'un enfant de la procédure,
  // ou sans enfant rattaché). Les totaux sont calculés sur ce périmètre.
  const idsProc = new Set(enfants.map((e) => e.id));
  const fraisProcedure = frais.filter(
    (f) => f.child_id === null || idsProc.has(f.child_id)
  );
  const documentsProcedure = documents.filter(
    (d) => d.childId === null || idsProc.has(d.childId)
  );

  // Les totaux, recalculés à chaque affichage (sur la procédure active)
  const resteAPercevoir = fraisProcedure
    .filter((f) => !f.rembourse)
    .reduce((somme, f) => somme + Number(f.part_autre), 0);

  const dejaRembourse = fraisProcedure
    .filter((f) => f.rembourse)
    .reduce((somme, f) => somme + Number(f.part_autre), 0);

  // Export CSV des frais de la procédure active (ce qui est affiché à l'écran).
  // Données factuelles uniquement : aucun jugement, aucune qualification.
  function exporterCsv() {
    const enTete = [
      "Date",
      "Catégorie",
      "Libellé",
      "Enfant",
      "Montant total",
      "Part due",
      "Statut",
      "Justificatif",
    ];
    const lignes = fraisProcedure.map((f) => [
      f.date_frais ?? "",
      f.categorie ?? "",
      f.libelle ?? "",
      nomEnfant(f.child_id) ?? "",
      euros(Number(f.montant)),
      euros(Number(f.part_autre)),
      f.rembourse ? "Remboursé" : "Non remboursé",
      f.document_id ? "Oui" : "Non",
    ]);
    const csv = construireCsv({
      enTete,
      lignes,
      contexte: { titre: "Frais partagés" },
    });
    const nomFichier = `frais-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Finances"
        title="Frais partagés"
        subtitle="Suivez moi par moi ce qui est dû et ce qui a été payé"
      />

      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">
      <div className="mt-6">
          <RegleFrais/>
        </div>

        {/* Bandeau de totaux */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="carte rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Reste à percevoir</p>
            <p className="mt-1 text-2xl font-bold text-[#15233F]">{euros(resteAPercevoir)}</p>
          </div>
          <div className="carte rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Déjà remboursé</p>
            <p className="mt-1 text-2xl font-bold text-slate-500">{euros(dejaRembourse)}</p>
          </div>
        </div>

        {/* Export CSV */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={exporterCsv}
            disabled={fraisProcedure.length === 0}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-[#15233F] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter en CSV
          </button>
        </div>

        {/* Formulaire. La clé force l'ouverture de l'encart quand un
            pré-remplissage arrive (sans modifier le composant partagé). */}
        <div className="mt-8">
          <EncartPliable
            key={preRempli ? "frais-prerempli" : "frais-standard"}
            titre="Ajouter un frais"
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
                Vérifiez chaque champ, complétez si besoin, puis cliquez sur « Ajouter le frais » pour valider vous-même l’enregistrement.
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
            <label className="block text-sm font-medium text-slate-700">Libellé</label>
            <input
              type="text" placeholder="Ex : Consultation orthodontiste"
              value={libelle} onChange={(e) => setLibelle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Montant total (€)</label>
              <input
                type="text" inputMode="decimal" placeholder="80"
                value={montant} onChange={(e) => setMontant(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Part de l&apos;autre (€)</label>
              <input
                type="text" inputMode="decimal" placeholder="auto : moitié"
                value={partAutre} onChange={(e) => setPartAutre(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date" value={dateFrais}
                onChange={(e) => setDateFrais(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Justificatif (facultatif)</label>
            <select
              value={documentId} onChange={(e) => setDocumentId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">— Aucun —</option>
              {documentsProcedure.map((d) => (
                <option key={d.id} value={d.id}>{d.categorie} · {d.libelle}</option>
              ))}
            </select>
            {documentsProcedure.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Aucun justificatif disponible. Ajoutez vos pièces dans « Documents » pour pouvoir les lier ici.
              </p>
            )}
          </div>

          <button
            onClick={ajouterFrais}
            className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
          >
            Ajouter le frais
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
            </div>
          </EncartPliable>
        </div>

        {/* Liste */}
        <div className="mt-8 space-y-3">
          {fraisProcedure.length === 0 && (
            <p className="text-slate-500">Aucun frais enregistré pour cette procédure.</p>
          )}
          {fraisProcedure.map((f) => (
            <div
              key={f.id}
              className={`carte rounded-xl border p-4 ${
                f.rembourse ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {f.categorie}
                  </span>
                  <p className="mt-1.5 font-semibold text-[#15233F]">{f.libelle}</p>
                  <p className="text-sm text-slate-500">
                    {f.date_frais} · Total {euros(Number(f.montant))} · Part due {euros(Number(f.part_autre))}
                    {nomEnfant(f.child_id) ? ` · ${nomEnfant(f.child_id)}` : ""}
                  </p>
                  {f.rembourse && (
                    <span className="mt-1 inline-block text-xs font-medium text-green-700">
                      ✓ Remboursé
                    </span>
                  )}

                  {/* Justificatif lié ou non */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {f.document_id ? (
                      <>
                        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800">
                          ✓ Justificatif joint
                        </span>
                        <button
                          onClick={() => ouvrirJustificatif(f.document_id!)}
                          className="text-xs text-slate-700 hover:underline"
                        >
                          Ouvrir
                        </button>
                      </>
                    ) : (
                      <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800">
                        Sans justificatif
                      </span>
                    )}
                    <select
                      value={f.document_id ?? ""}
                      onChange={(e) => lierJustificatif(f.id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="">— Lier un justificatif —</option>
                      {documentsProcedure.map((d) => (
                        <option key={d.id} value={d.id}>{d.categorie} · {d.libelle}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => basculerRembourse(f)}
                    className="text-sm text-slate-700 hover:underline"
                  >
                    {f.rembourse ? "Annuler" : "Marquer remboursé"}
                  </button>
                  <button
                    onClick={() => supprimerFrais(f.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
      }