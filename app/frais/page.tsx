"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import { Icon } from "@/components/apercu/icones";
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
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

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
  const libelleRef = useRef<HTMLInputElement>(null);

  // Ouvre directement le formulaire d'ajout d'un frais (mode ajout, encart déplié),
  // puis fait défiler vers le formulaire et place le focus sur « Libellé ».
  // Utilisé par les boutons « Ajouter une dépense » / « Ajouter un frais ».
  function openAddFraisForm() {
    setEditionId(null);
    setFormulaireOuvert(true);
    // Le formulaire est monté après ce rendu : on diffère le scroll + focus.
    setTimeout(() => {
      formulaireRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      libelleRef.current?.focus();
    }, 60);
  }

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
    setFormulaireOuvert(true);
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
    setFormulaireOuvert(true);
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
      setFormulaireOuvert(false);
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
  const moisCourant = new Date().toISOString().slice(0, 7);
  const fraisDuMois = fraisProcedure.filter((f) => f.date_frais?.startsWith(moisCourant));
  const totalMois = fraisDuMois.reduce((somme, f) => somme + Number(f.montant), 0);
  const sansJustificatif = fraisProcedure.filter((f) => !f.document_id).length;

  // Les totaux, recalculés à chaque affichage (sur la procédure active)
  const resteAPercevoir = fraisProcedure
    .filter((f) => !f.rembourse)
    .reduce((somme, f) => somme + Number(f.part_autre), 0);

  const dejaRembourse = fraisProcedure
    .filter((f) => f.rembourse)
    .reduce((somme, f) => somme + Number(f.part_autre), 0);

  const fraisFiltres = fraisProcedure.filter((f) => {
    const statutOk =
      filtreStatut === "Tous" ||
      (filtreStatut === "À rembourser" && !f.rembourse) ||
      (filtreStatut === "Remboursé" && f.rembourse) ||
      (filtreStatut === "En attente" && !f.rembourse && !f.document_id);
    const categorieOk = filtreCategorie === "Toutes" || f.categorie === filtreCategorie;
    return statutOk && categorieOk;
  });

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
      activeModule="frais"
      title="Frais"
      subtitle="Dépenses liées aux enfants, classées et exportables."
      copilotContext="frais"
      actions={
        <>
          <button
            type="button"
            onClick={exporterCsv}
            disabled={fraisProcedure.length === 0}
            className="hidden items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
            style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)", color: "var(--app-text-muted)" }}
          >
            <Icon name="syntheses" className="h-4 w-4" />
            Exporter
          </button>
          <button
            type="button"
            data-testid="frais-add-toggle"
            onClick={openAddFraisForm}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition md:inline-flex"
            style={{ backgroundColor: "var(--app-primary)" }}
          >
            <Icon name="plus" className="h-4 w-4" />
            Ajouter une dépense
          </button>
        </>
      }
    >
      {false && null}
      {false && <span
        data-eyebrow="Finances"
        title="Frais partagés"
        data-subtitle="Suivez moi par moi ce qui est dû et ce qui a été payé"
      />}

      <div className="space-y-4">
        <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
          <CarteSynthese label="Total du mois" valeur={euros(totalMois)} indice={`${fraisDuMois.length} dépense${fraisDuMois.length > 1 ? "s" : ""}`} />
          <CarteSynthese label="À rembourser" valeur={euros(resteAPercevoir)} indice={`${fraisProcedure.filter((f) => !f.rembourse).length} en cours`} ton="attention" />
          <CarteSynthese label="Remboursé" valeur={euros(dejaRembourse)} indice={`${fraisProcedure.filter((f) => f.rembourse).length} frais`} ton="succes" />
          <CarteSynthese label="Sans justificatif" valeur={String(sansJustificatif)} indice={sansJustificatif > 0 ? "à compléter" : "complet"} ton={sansJustificatif > 0 ? "danger" : "neutre"} />
        </div>

        <div className="min-w-0 rounded-lg border p-3" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
          <div className="space-y-2">
            <FiltrePills options={["Tous", "À rembourser", "Remboursé", "En attente"]} actif={filtreStatut} onChange={setFiltreStatut} />
            <FiltrePills options={["Toutes", ...CATEGORIES]} actif={filtreCategorie} onChange={setFiltreCategorie} />
          </div>
          <div className="mt-3 flex gap-2 sm:hidden">
            <button type="button" onClick={exporterCsv} disabled={fraisProcedure.length === 0} className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>
              Export CSV
            </button>
            <button type="button" onClick={openAddFraisForm} className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--app-primary)" }}>
              Ajouter
            </button>
          </div>
        </div>

        {/* Bandeau de totaux */}
        <div className="hidden">
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
        <div className="hidden">
          <button
            onClick={exporterCsv}
            disabled={fraisProcedure.length === 0}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-[#15233F] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter en CSV
          </button>
        </div>

        {/* Formulaire. La clé force l'ouverture de l'encart quand un
            pré-remplissage arrive ou quand on édite un frais. */}
        {formulaireOuvert && (
        <div className="mt-4" ref={formulaireRef} data-testid="frais-add-section">
          <EncartPliable
            key={editionId ? `frais-edition-${editionId}` : preRempli ? "frais-prerempli" : "frais-standard"}
            titre={editionId ? "Modifier le frais" : "Ajouter un frais"}
            testId="frais-add-encart"
            open={formulaireOuvert}
            onOpenChange={setFormulaireOuvert}
            signalFermeture={signalAjout}
          >
            <div className="space-y-4" data-testid="frais-add-form">
          {editionId && (
            <div className="rounded-lg border border-[#C2A24C]/50 bg-[#F8F6F1] p-3 text-sm text-[#1F2733]">
              <p className="font-medium text-[#15233F]">Modification d&apos;un frais existant.</p>
              <p className="mt-1 text-slate-600">
                Ajustez les champs puis enregistrez. Vous pouvez annuler pour revenir à la liste sans modifier.
              </p>
            </div>
          )}
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
            <label className="block text-sm font-medium text-slate-700">
              Libellé <span className="text-[#9B2C2C]">*</span>
            </label>
            <input
              ref={libelleRef}
              type="text" placeholder="Ex : Consultation orthodontiste"
              value={libelle} onChange={(e) => setLibelle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Montant total (€) <span className="text-[#9B2C2C]">*</span>
              </label>
              <input
                type="text" inputMode="decimal" placeholder="80"
                value={montant} onChange={(e) => setMontant(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date <span className="text-[#9B2C2C]">*</span>
              </label>
              <input
                type="date" value={dateFrais}
                onChange={(e) => setDateFrais(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
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

          {/* Détails non indispensables au premier enregistrement.
              S'ouvrent d'office quand l'Agent a pré-rempli (clé remontée plus haut). */}
          <OptionsAvancees ouvertParDefaut={preRempli}>
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
              <label className="block text-sm font-medium text-slate-700">Part de l&apos;autre (€)</label>
              <input
                type="text" inputMode="decimal" placeholder="Laisser vide pour la moitié"
                value={partAutre} onChange={(e) => setPartAutre(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-500">
                Si vous laissez ce champ vide, la part de l&apos;autre parent est
                estimée à la moitié du montant. Vous pouvez saisir un autre montant
                selon la règle de partage de votre dossier.
              </p>
            </div>
          </OptionsAvancees>

          {/* Justificatif guidé. Optionnel : sans justificatif, le frais reste
              valable et exportable. */}
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">Justificatif</p>

            {documentId ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800">
                  ✓ Justificatif joint
                </span>
                <span className="text-sm text-slate-600">{nomDocument(documentId)}</span>
                <button
                  type="button"
                  onClick={reinitialiserJustificatif}
                  className="text-sm text-slate-700 hover:underline"
                >
                  Changer
                </button>
              </div>
            ) : justifEtape === "question" ? (
              <>
                <p className="mt-1 text-xs text-slate-500">
                  Un justificatif n&apos;est pas obligatoire : le frais reste
                  valable et exportable.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setJustifEtape("oui")}
                    className="rounded-lg border border-[#15233F]/30 px-3 py-2 text-sm text-[#15233F] hover:bg-[#15233F]/5"
                  >
                    Oui, j&apos;ai un justificatif
                  </button>
                  <button
                    type="button"
                    onClick={() => setJustifEtape("aucun")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Non, pas de justificatif
                  </button>
                </div>
              </>
            ) : justifEtape === "aucun" ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-sm text-slate-600">
                  Aucun justificatif. Le frais reste valable et exportable.
                </p>
                <button
                  type="button"
                  onClick={() => setJustifEtape("question")}
                  className="text-sm text-slate-700 hover:underline"
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
                    className="rounded-lg bg-[#15233F] px-3 py-2 text-sm text-white hover:bg-[#1d2f52] disabled:opacity-50"
                  >
                    {uploadEnCours ? "Envoi en cours…" : "Téléverser un justificatif"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMontrerSelection((v) => !v)}
                    className="rounded-lg border border-[#15233F]/30 px-3 py-2 text-sm text-[#15233F] hover:bg-[#15233F]/5"
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

                <p className="text-xs text-slate-500">
                  Le téléversement ouvre l&apos;appareil photo ou les fichiers de
                  votre appareil. La pièce est aussi ajoutée à « Documents ».
                </p>

                <FormMessage message={uploadErreur} type="erreur" />

                {montrerSelection && (
                  <div>
                    <select
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="">— Choisir une pièce —</option>
                      {documentsProcedure.map((d) => (
                        <option key={d.id} value={d.id}>{d.categorie} · {d.libelle}</option>
                      ))}
                    </select>
                    {documentsProcedure.length === 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Aucune pièce disponible. Ajoutez vos pièces dans « Documents ».
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setJustifEtape("question")}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Retour
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="frais-submit"
              onClick={ajouterFrais}
              className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
            >
              {editionId ? "Enregistrer les modifications" : "Ajouter le frais"}
            </button>
            {editionId && (
              <button
                type="button"
                onClick={annulerEdition}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
            )}
          </div>
          <FormMessage message={message} type="erreur" />
            </div>
          </EncartPliable>
        </div>
        )}

        {confirmation && (
          <div className="mt-6 rounded-lg border border-[#2E6A4D]/30 bg-[#2E6A4D]/5 px-4 py-3">
            <FormMessage message={confirmation} type="succes" />
          </div>
        )}

        {/* Liste */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--app-text)" }}>
                Frais déclarés
              </h2>
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                {fraisFiltres.length} frais affiché{fraisFiltres.length > 1 ? "s" : ""} sur cette procédure.
              </p>
            </div>
          </div>
          {fraisFiltres.length === 0 && (
            <EmptyState
              titre="Aucun frais pour cette procédure"
              message="Ajoutez vos frais pour garder une trace claire des dépenses liées au dossier : date, montant, justificatif et statut de remboursement."
              action={
                <button
                  type="button"
                  onClick={openAddFraisForm}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--app-primary)" }}
                >
                  <Icon name="plus" className="h-4 w-4" />
                  Ajouter un frais
                </button>
              }
            />
          )}
          {fraisFiltres.map((f) => (
            <div
              key={f.id}
              className="min-w-0 overflow-hidden rounded-lg border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--app-tag-bg)",
                        borderColor: "var(--app-tag-border)",
                        color: "var(--app-tag-text)",
                      }}
                    >
                      {f.categorie}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: f.rembourse ? "rgba(46, 106, 77, 0.08)" : "var(--app-primary-soft)",
                        borderColor: f.rembourse ? "rgba(46, 106, 77, 0.3)" : "var(--app-border)",
                        color: f.rembourse ? "var(--vert)" : "var(--app-primary)",
                      }}
                    >
                      {f.rembourse ? "Remboursé" : "À rembourser"}
                    </span>
                  </div>

                  <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-semibold" style={{ color: "var(--app-text)" }}>
                        {f.libelle}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: "var(--app-text-muted)" }}>
                        <span>{f.date_frais}</span>
                        {nomEnfant(f.child_id) && <span>{nomEnfant(f.child_id)}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-base font-semibold" style={{ color: "var(--app-text)" }}>
                        {euros(Number(f.montant))}
                      </p>
                      <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                        Part due : {euros(Number(f.part_autre))}
                      </p>
                    </div>
                  </div>

                  {/* Justificatif lié ou non */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
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
                    ) : f.sans_justificatif ? (
                      <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
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
                      className="max-w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="">— Lier un justificatif —</option>
                      {documentsProcedure.map((d) => (
                        <option key={d.id} value={d.id}>{d.categorie} · {d.libelle}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <button
                    onClick={() => chargerPourEdition(f)}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:w-auto"
                    style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => basculerRembourse(f)}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:w-auto"
                    style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
                  >
                    {f.rembourse ? "Annuler" : "Marquer remboursé"}
                  </button>
                  <button
                    onClick={() => supprimerFrais(f.id)}
                    className="w-full rounded-lg border px-2.5 py-1.5 text-xs font-medium transition sm:w-auto"
                    style={{ borderColor: "var(--app-danger, #9B2C2C)", color: "var(--app-danger, #9B2C2C)" }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="min-w-0">
          <RegleFrais />
        </section>
      </div>
    </AppShell>
  );
      }

type SyntheseTon = "neutre" | "attention" | "succes" | "danger";

function CarteSynthese({
  label,
  valeur,
  indice,
  ton = "neutre",
}: {
  label: string;
  valeur: string;
  indice: string;
  ton?: SyntheseTon;
}) {
  const couleur =
    ton === "danger"
      ? "var(--app-danger, #9B2C2C)"
      : ton === "attention"
        ? "var(--app-primary)"
        : "var(--app-text)";
  return (
    <section
      className="rounded-lg border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--app-text-muted)" }}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold" style={{ color: couleur }}>
        {valeur}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--app-text-muted)" }}>
        {indice}
      </p>
    </section>
  );
}

function FiltrePills({
  options,
  actif,
  onChange,
}: {
  options: string[];
  actif: string;
  onChange: (valeur: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
      {options.map((option) => {
        const selectionne = option === actif;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition"
            style={{
              borderColor: selectionne ? "var(--app-primary)" : "var(--app-border)",
              backgroundColor: selectionne ? "var(--app-primary-soft)" : "transparent",
              color: selectionne ? "var(--app-primary)" : "var(--app-text-muted)",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
