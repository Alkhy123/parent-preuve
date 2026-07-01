"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import EncartPliable from "@/components/EncartPliable";
import FormMessage from "@/components/ui/FormMessage";
import EmptyState from "@/components/ui/EmptyState";
import OptionsAvancees from "@/components/ui/OptionsAvancees";
import { euros } from "@/lib/dossierCalculs";
import RegleFrais from '@/components/RegleFrais';
import { getEnfantsDeProcedureActive, getProcedureActiveId } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";
import {
  nettoyerProposition,
  CLE_SESSION_PREREMPLISSAGE,
} from "@/lib/preRemplissage";
import HomeGuidedHint from "@/components/home/HomeGuidedHint";
import SecondaryHero from "@/components/secondary/SecondaryHero";
import SecondaryMetrics from "@/components/secondary/SecondaryMetrics";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

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
  sans_justificatif: boolean;
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
  const [confirmation, setConfirmation] = useState("");
  const [signalAjout, setSignalAjout] = useState(0);

  const { interfaceStyle } = useUiPreferences();
  const isBoard10 = interfaceStyle === "board10";

  // Section justificatif guidée. "question" = on demande oui/non ;
  // "oui" = on propose téléverser ou sélectionner ; "aucun" = pas de justificatif
  // (le frais reste valable et exportable). documentId tient la pièce liée.
  const [justifEtape, setJustifEtape] = useState<"question" | "oui" | "aucun">("question");
  const [montrerSelection, setMontrerSelection] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [uploadErreur, setUploadErreur] = useState("");
  const champFichierRef = useRef<HTMLInputElement>(null);

  // Édition d'un frais existant. null = mode ajout ; sinon l'id du frais modifié.
  const [editionId, setEditionId] = useState<string | null>(null);
  const formulaireRef = useRef<HTMLDivElement>(null);

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
    const procId = await getProcedureActiveId();
    if (!procId) {
      setDocuments([]);
      return;
    }
    const { data } = await supabase
      .from("documents")
      .select("id, libelle, categorie, chemin_fichier, child_id")
      .eq("procedure_id", procId)
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
    const procId = await getProcedureActiveId();
    if (!procId) {
      setFrais([]);
      return;
    }
    const { data, error } = await supabase
      .from("expenses")
      .select("id, libelle, categorie, montant, part_autre, date_frais, rembourse, child_id, document_id, sans_justificatif")
      .eq("procedure_id", procId)
      .order("date_frais", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setFrais(data ?? []);
  }

  useEffect(() => {
    // Chargements async (setState après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // Pré-remplissage one-shot lu au montage (pas de cascade de rendu).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // Rapprochement du prénom proposé une fois les enfants chargés.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (trouve) setChildId(trouve.id);
    setEnfantPropose(null);
  }, [enfants, enfantPropose]);

  // Remet la section justificatif à son état initial (question oui/non).
  function reinitialiserJustificatif() {
    setDocumentId("");
    setJustifEtape("question");
    setMontrerSelection(false);
    setUploadErreur("");
  }

  // Téléverse un fichier (photo ou PDF) dans le bucket justificatifs, crée la
  // pièce dans `documents` et la rattache au frais en cours. Même logique que la
  // page Documents. La pièce reste valable indépendamment du frais.
  async function televerserJustificatif(fichier: File) {
    setUploadErreur("");
    setUploadEnCours(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setUploadErreur("Vous devez être connecté.");
        return;
      }

      // Cloisonnement : on résout la procédure AVANT l'upload pour ne pas
      // laisser de fichier orphelin si aucune procédure n'est active.
      const procedureId = await getProcedureActiveId();
      if (!procedureId) {
        setUploadErreur(
          "Aucune procédure active. Créez d'abord une procédure avant d'ajouter une pièce."
        );
        return;
      }

      const nomNettoye = fichier.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const chemin = `${userId}/${Date.now()}-${nomNettoye}`;

      const { error: uploadError } = await supabase.storage
        .from("justificatifs")
        .upload(chemin, fichier);
      if (uploadError) {
        setUploadErreur("Erreur d'envoi : " + uploadError.message);
        return;
      }

      const { data: cree, error: insertError } = await supabase
        .from("documents")
        .insert({
          libelle: (libelle.trim() || fichier.name).slice(0, 200),
          categorie: "Facture",
          chemin_fichier: chemin,
          date_document: dateFrais || null,
          child_id: childId || null,
          procedure_id: procedureId,
        })
        .select("id")
        .single();
      if (insertError || !cree) {
        // Insertion échouée après l'upload : on retire le fichier orphelin.
        await supabase.storage.from("justificatifs").remove([chemin]);
        setUploadErreur(
          "Erreur d'enregistrement : " + (insertError?.message ?? "inconnue")
        );
        return;
      }

      setDocumentId(cree.id);
      setMontrerSelection(false);
      await chargerDocuments();
    } finally {
      setUploadEnCours(false);
    }
  }

  // Charge un frais existant dans le formulaire pour le modifier.
  function chargerPourEdition(f: Frais) {
    setMessage("");
    setConfirmation("");
    setEditionId(f.id);
    setLibelle(f.libelle ?? "");
    setCategorie(f.categorie ?? "Autre");
    setMontant(String(f.montant ?? ""));
    setPartAutre(String(f.part_autre ?? ""));
    setDateFrais(f.date_frais ?? "");
    setChildId(f.child_id ?? "");
    setDocumentId(f.document_id ?? "");
    setMontrerSelection(false);
    setUploadErreur("");
    // État justificatif : joint si pièce liée, "aucun" si choix explicite, sinon question.
    setJustifEtape(f.document_id ? "question" : f.sans_justificatif ? "aucun" : "question");
    // Pré-remplissage Agent éventuel : on l'efface pour ne pas mélanger les bandeaux.
    setPreRempli(false); setAvertissements([]); setEnfantPropose(null);
    formulaireRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Quitte l'édition sans enregistrer et vide le formulaire.
  function annulerEdition() {
    setEditionId(null);
    setMessage("");
    setLibelle(""); setCategorie("Autre"); setMontant("");
    setPartAutre(""); setDateFrais(""); setChildId("");
    reinitialiserJustificatif();
  }

  async function ajouterFrais() {
    setMessage("");
    setConfirmation("");
    if (!libelle.trim()) return setMessage("Le libellé est obligatoire.");
    if (!dateFrais) return setMessage("La date est obligatoire.");
    const montantNum = parseFloat(montant.replace(",", "."));
    if (isNaN(montantNum)) return setMessage("Le montant doit être un nombre.");

    // Si la part de l'autre n'est pas saisie, on propose la moitié par défaut
    const partNum = partAutre.trim()
      ? parseFloat(partAutre.replace(",", "."))
      : montantNum / 2;

    // Mémorise le choix explicite « sans justificatif » : vrai seulement si aucune
    // pièce n'est liée ET que l'utilisateur a cliqué « Non, pas de justificatif ».
    const sansJustif = !documentId && justifEtape === "aucun";

    const payload = {
      libelle: libelle.trim(),
      categorie,
      montant: montantNum,
      part_autre: isNaN(partNum) ? 0 : partNum,
      date_frais: dateFrais,
      child_id: childId || null,
      document_id: documentId || null,
      sans_justificatif: sansJustif,
    };

    // Cloisonnement : un nouveau frais appartient directement à la procédure
    // active. On ne touche pas `procedure_id` en édition pour ne pas déplacer
    // silencieusement une ligne d'une procédure à une autre.
    const procedureId = await getProcedureActiveId();
    if (!procedureId)
      return setMessage(
        "Aucune procédure active. Créez d'abord une procédure avant d'ajouter un frais."
      );
    let resultat;
    if (editionId) {
      // .eq("procedure_id") scope l'update à la procédure active (cloisonnement) ;
      // procedure_id n'est PAS dans payload, donc la ligne n'est pas déplacée.
      resultat = await supabase
        .from("expenses")
        .update(payload)
        .eq("id", editionId)
        .eq("procedure_id", procedureId);
    } else {
      resultat = await supabase
        .from("expenses")
        .insert({ ...payload, procedure_id: procedureId });
    }
    const { error } = resultat;

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      const etaitEdition = editionId !== null;
      setEditionId(null);
      setLibelle(""); setCategorie("Autre"); setMontant("");
      setPartAutre(""); setDateFrais(""); setChildId("");
      reinitialiserJustificatif();
      // Fin du cycle de pré-remplissage : on retire le bandeau et on referme.
      setPreRempli(false); setAvertissements([]); setEnfantPropose(null);
      setConfirmation(
        etaitEdition
          ? "Frais modifié."
          : "Frais ajouté. Vous pouvez lui lier un justificatif depuis la liste ci-dessous si besoin."
      );
      setSignalAjout((n) => n + 1);
      chargerFrais();
    }
  }

  // Lier (ou délier si chaîne vide) un justificatif à un frais existant.
  async function lierJustificatif(fraisId: string, docId: string) {
    const procId = await getProcedureActiveId();
    if (!procId) return;
    const { error } = await supabase
      .from("expenses")
      .update({ document_id: docId || null })
      .eq("id", fraisId)
      .eq("procedure_id", procId);
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
    const procId = await getProcedureActiveId();
    if (!procId) return;
    const { error } = await supabase
      .from("expenses")
      .update({ rembourse: !f.rembourse })
      .eq("id", f.id)
      .eq("procedure_id", procId);
    if (error) setMessage("Erreur : " + error.message);
    else chargerFrais();
  }

  async function supprimerFrais(id: string) {
    const procId = await getProcedureActiveId();
    if (!procId) return;
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("procedure_id", procId);
    if (error) setMessage("Erreur : " + error.message);
    else chargerFrais();
  }

  function nomEnfant(id: string | null) {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  // Libellé lisible d'une pièce liée (catégorie · libellé), pour l'état "joint".
  function nomDocument(id: string) {
    const d = documents.find((doc) => doc.id === id);
    return d ? `${d.categorie} · ${d.libelle}` : "Justificatif joint";
  }

  // Cloisonnement assuré en base (procedure_id) lors du chargement.
  // Les totaux sont calculés sur ce périmètre.
  const fraisProcedure = frais;
  const documentsProcedure = documents;

  // Les totaux, recalculés à chaque affichage (sur la procédure active)
  const resteAPercevoir = fraisProcedure
    .filter((f) => !f.rembourse)
    .reduce((somme, f) => somme + Number(f.part_autre), 0);

  const dejaRembourse = fraisProcedure
    .filter((f) => f.rembourse)
    .reduce((somme, f) => somme + Number(f.part_autre), 0);

  // Métriques pour Vue d'ensemble (dérivées depuis l'état déjà chargé).
  const nbSansJustif = fraisProcedure.filter((f) => !f.rembourse && !f.sans_justificatif && !f.document_id).length;
  const metriqueFrais = [
    { label: "Frais saisis", value: fraisProcedure.length, variant: "neutre" as const },
    { label: "En attente", value: fraisProcedure.filter((f) => !f.rembourse).length, variant: resteAPercevoir > 0 ? "warning" as const : "neutre" as const },
    { label: "Remboursés", value: fraisProcedure.filter((f) => f.rembourse).length, variant: "success" as const },
    { label: "Sans justificatif", value: nbSansJustif, variant: nbSansJustif > 0 ? "danger" as const : "neutre" as const },
  ];

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
    <AppShell
      titre="Frais"
      description={isBoard10 ? "Ajoutez rapidement vos frais et conservez les justificatifs." : "Suivez les remboursements, les totaux et les justificatifs manquants."}
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/collecter" variant="secondary">
            Retour Collecter
          </AppButtonLink>
          <AppButtonLink href="/resume-mois" variant="secondary">
            Resume du mois
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Hero Board10 ou métriques Vue d'ensemble */}
        {isBoard10 ? (
          <SecondaryHero
            titre="Action rapide"
            ctaLabel="Ajouter un frais"
            ctaHref="#ajouter-frais"
          />
        ) : (
          <SecondaryMetrics items={metriqueFrais} />
        )}

        <div id="ajouter-frais" />
        <RegleFrais />

        {/* Bandeau de totaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <p className="text-sm text-[var(--app-text-muted)]">Reste à percevoir</p>
            <p className="mt-1 text-2xl font-bold text-[var(--app-text)]">{euros(resteAPercevoir)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <p className="text-sm text-[var(--app-text-muted)]">Déjà remboursé</p>
            <p className="mt-1 text-2xl font-bold text-[var(--app-text-muted)]">{euros(dejaRembourse)}</p>
          </div>
        </div>

        {/* Export CSV */}
        <div className="flex justify-end">
          <button
            onClick={exporterCsv}
            disabled={fraisProcedure.length === 0}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter en CSV
          </button>
        </div>

        {/* Formulaire. La clé force l'ouverture de l'encart quand un
            pré-remplissage arrive ou quand on édite un frais. */}
        <div ref={formulaireRef}>
          <EncartPliable
            key={editionId ? `frais-edition-${editionId}` : preRempli ? "frais-prerempli" : "frais-standard"}
            titre={editionId ? "Modifier le frais" : "Ajouter un frais"}
            replieParDefaut={isBoard10 ? false : !preRempli && !editionId}
            signalFermeture={signalAjout}
          >
            <div className="space-y-4">
              {editionId && (
                <AppNotice titre="Modification d'un frais">
                  <p>
                    Ajustez les champs puis enregistrez. Vous pouvez annuler pour
                    revenir à la liste sans modifier.
                  </p>
                </AppNotice>
              )}
              {preRempli && (
                <AppNotice titre="Proposition pré-remplie à vérifier">
                  <p>
                    Vérifiez chaque champ, complétez si besoin, puis cliquez sur
                    « Ajouter le frais » pour valider vous-même
                    l&apos;enregistrement.
                  </p>
                  {avertissements.length > 0 && (
                    <ul className="mt-2 list-disc pl-5">
                      {avertissements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                </AppNotice>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--app-text)]">
                  Libellé <span className="text-[var(--app-danger,#9b2c2c)]">*</span>
                </label>
                <input
                  type="text" placeholder="Ex : Consultation orthodontiste"
                  value={libelle} onChange={(e) => setLibelle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--app-text)]">
                    Montant total (€) <span className="text-[var(--app-danger,#9b2c2c)]">*</span>
                  </label>
                  <input
                    type="text" inputMode="decimal" placeholder="80"
                    value={montant} onChange={(e) => setMontant(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--app-text)]">
                    Date <span className="text-[var(--app-danger,#9b2c2c)]">*</span>
                  </label>
                  <input
                    type="date" value={dateFrais}
                    onChange={(e) => setDateFrais(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--app-text)]">Enfant concerné</label>
                <select
                  value={childId} onChange={(e) => setChildId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2"
                >
                  <option value="">- Aucun -</option>
                  {enfants.map((e) => (
                    <option key={e.id} value={e.id}>{e.prenom_ou_alias}</option>
                  ))}
                </select>
              </div>

              {/* Détails non indispensables au premier enregistrement.
                  S'ouvrent d'office quand l'Agent a pré-rempli (clé remontée plus haut). */}
              <OptionsAvancees ouvertParDefaut={preRempli}>
                <div>
                  <label className="block text-sm font-medium text-[var(--app-text)]">Catégorie</label>
                  <select
                    value={categorie} onChange={(e) => setCategorie(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--app-text)]">Part de l&apos;autre (€)</label>
                  <input
                    type="text" inputMode="decimal" placeholder="Laisser vide pour la moitié"
                    value={partAutre} onChange={(e) => setPartAutre(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                    Si vous laissez ce champ vide, la part de l&apos;autre parent est
                    estimée à la moitié du montant. Vous pouvez saisir un autre montant
                    selon la règle de partage de votre dossier.
                  </p>
                </div>
              </OptionsAvancees>

              {/* Justificatif guidé. Optionnel : sans justificatif, le frais reste
                  valable et exportable. */}
              <div className="rounded-lg border border-[var(--app-border)] p-4">
                <p className="text-sm font-medium text-[var(--app-text)]">Justificatif</p>

                {documentId ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800">
                      ✓ Justificatif joint
                    </span>
                    <span className="text-sm text-[var(--app-text-muted)]">{nomDocument(documentId)}</span>
                    <button
                      type="button"
                      onClick={reinitialiserJustificatif}
                      className="text-sm text-[var(--app-text)] hover:underline"
                    >
                      Changer
                    </button>
                  </div>
                ) : justifEtape === "question" ? (
                  <>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                      Un justificatif n&apos;est pas obligatoire : le frais reste
                      valable et exportable.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setJustifEtape("oui")}
                        className="rounded-lg border border-[var(--app-primary)]/30 px-3 py-2 text-sm text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]"
                      >
                        Oui, j&apos;ai un justificatif
                      </button>
                      <button
                        type="button"
                        onClick={() => setJustifEtape("aucun")}
                        className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                      >
                        Non, pas de justificatif
                      </button>
                    </div>
                  </>
                ) : justifEtape === "aucun" ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-sm text-[var(--app-text-muted)]">
                      Aucun justificatif. Le frais reste valable et exportable.
                    </p>
                    <button
                      type="button"
                      onClick={() => setJustifEtape("question")}
                      className="text-sm text-[var(--app-text)] hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => champFichierRef.current?.click()}
                        disabled={uploadEnCours}
                        className="rounded-lg bg-[var(--app-primary)] px-3 py-2 text-sm text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)] disabled:opacity-50"
                      >
                        {uploadEnCours ? "Envoi en cours..." : "Téléverser un justificatif"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMontrerSelection((v) => !v)}
                        className="rounded-lg border border-[var(--app-primary)]/30 px-3 py-2 text-sm text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]"
                      >
                        Sélectionner un justificatif existant
                      </button>
                    </div>

                    <input
                      ref={champFichierRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) televerserJustificatif(f);
                        e.target.value = "";
                      }}
                    />

                    <p className="text-xs text-[var(--app-text-muted)]">
                      Le téléversement ouvre l&apos;appareil photo ou les fichiers de
                      votre appareil. La pièce est aussi ajoutée à « Documents ».
                    </p>

                    <FormMessage message={uploadErreur} type="erreur" />

                    {montrerSelection && (
                      <div>
                        <select
                          value={documentId}
                          onChange={(e) => setDocumentId(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2"
                        >
                          <option value="">- Choisir une pièce -</option>
                          {documentsProcedure.map((d) => (
                            <option key={d.id} value={d.id}>{d.categorie} · {d.libelle}</option>
                          ))}
                        </select>
                        {documentsProcedure.length === 0 && (
                          <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                            Aucune pièce disponible. Ajoutez vos pièces dans « Documents ».
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setJustifEtape("question")}
                      className="text-xs text-[var(--app-text-muted)] hover:underline"
                    >
                      Retour
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={ajouterFrais}
                  className="rounded-lg bg-[var(--app-primary)] px-5 py-2 text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                >
                  {editionId ? "Enregistrer les modifications" : "Ajouter le frais"}
                </button>
                {editionId && (
                  <button
                    type="button"
                    onClick={annulerEdition}
                    className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                  >
                    Annuler
                  </button>
                )}
              </div>
              <FormMessage message={message} type="erreur" />
            </div>
          </EncartPliable>
        </div>

        {confirmation && (
          <div className="rounded-lg border border-[var(--app-success,#2e6a4d)]/30 bg-[var(--app-success-soft,rgba(46,106,77,0.08))] px-4 py-3">
            <FormMessage message={confirmation} type="succes" />
          </div>
        )}

        <AppNotice titre="Rappel">
          <p>
            Vérifiez les justificatifs et les montants avant tout export ou
            transmission. Un justificatif reste lié à la procédure active.
          </p>
        </AppNotice>

        {/* Liste */}
        <AppCard>
          <div className="space-y-3">
            {fraisProcedure.length === 0 && (
              <EmptyState
                titre="Aucun frais pour cette procédure"
                message="Ajoutez un premier frais avec « Ajouter un frais » ci-dessus."
              />
            )}
            {fraisProcedure.map((f) => (
              <div
                key={f.id}
                className={`rounded-xl border p-4 ${
                  f.rembourse ? "border-[var(--app-border)] bg-[var(--app-surface-muted)]" : "border-[var(--app-border)] bg-[var(--app-surface)]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-[var(--app-tag-bg)] px-2.5 py-0.5 text-xs text-[var(--app-tag-text)]">
                      {f.categorie}
                    </span>
                    <p className="mt-1.5 font-semibold text-[var(--app-text)]">{f.libelle}</p>
                    <p className="text-sm text-[var(--app-text-muted)]">
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
                            className="text-xs text-[var(--app-text)] hover:underline"
                          >
                            Ouvrir
                          </button>
                        </>
                      ) : f.sans_justificatif ? (
                        <span className="inline-block rounded-full border border-[var(--app-tag-border)] bg-[var(--app-tag-bg)] px-2.5 py-0.5 text-xs text-[var(--app-tag-text)]">
                          Sans justificatif (choisi)
                        </span>
                      ) : (
                        <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800">
                          Sans justificatif
                        </span>
                      )}
                      <select
                        value={f.document_id ?? ""}
                        onChange={(e) => lierJustificatif(f.id, e.target.value)}
                        className="rounded-lg border border-[var(--app-border)] px-2 py-1 text-xs"
                      >
                        <option value="">- Lier un justificatif -</option>
                        {documentsProcedure.map((d) => (
                          <option key={d.id} value={d.id}>{d.categorie} · {d.libelle}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => chargerPourEdition(f)}
                      className="text-sm text-[var(--app-primary)] hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => basculerRembourse(f)}
                      className="text-sm text-[var(--app-text)] hover:underline"
                    >
                      {f.rembourse ? "Annuler" : "Marquer remboursé"}
                    </button>
                    <button
                      onClick={() => supprimerFrais(f.id)}
                      className="text-sm text-[var(--app-danger,#dc2626)] hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppCard>

        {/* Aide contextuelle — visible uniquement en mode guided */}
        <HomeGuidedHint>
          Ajoutez chaque frais dès qu&apos;il se produit, même sans justificatif immédiat.
          Vous pourrez lier la pièce justificative plus tard. Un frais daté et documenté
          est plus facilement pris en compte.
        </HomeGuidedHint>
      </div>
    </AppShell>
  );
}
