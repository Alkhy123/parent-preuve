"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import FormMessage from "@/components/ui/FormMessage";
import EmptyState from "@/components/ui/EmptyState";
import OptionsAvancees from "@/components/ui/OptionsAvancees";
import { getEnfantsDeProcedureActive, getProcedureActiveId } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";
import {
  CATEGORIES_IMPLICATION,
  libelleImplication,
} from "@/lib/implicationParentale";
import HomeGuidedHint from "@/components/home/HomeGuidedHint";
import SecondaryHero from "@/components/secondary/SecondaryHero";
import SecondaryMetrics from "@/components/secondary/SecondaryMetrics";
import { useUiPreferences } from "@/lib/ui-preferences/useUiPreferences";

type Enfant = { id: string; prenom_ou_alias: string };

type Document = {
  id: string;
  libelle: string;
  categorie: string;
  chemin_fichier: string;
  date_document: string | null;
  child_id: string | null;
  implication_categorie: string | null;
};

const CATEGORIES = ["Facture", "Certificat médical", "Capture d'écran", "Courrier", "Autre"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);

  const { interfaceStyle } = useUiPreferences();
  const isBoard10 = interfaceStyle === "board10";

  const [libelle, setLibelle] = useState("");
  const [categorie, setCategorie] = useState("Autre");
  const [dateDocument, setDateDocument] = useState("");
  const [childId, setChildId] = useState("");
  const [implicationCategorie, setImplicationCategorie] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);

  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [choixId, setChoixId] = useState<string | null>(null);

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
    const { data, error } = await supabase
      .from("documents")
      .select("id, libelle, categorie, chemin_fichier, date_document, child_id, implication_categorie")
      .eq("procedure_id", procId)
      .eq("etat", "actif")
      .order("created_at", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setDocuments(data ?? []);
  }

  useEffect(() => {
    // Chargements async (setState après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerEnfants();
    chargerDocuments();
  }, []);

  // Classement : pièces déjà cloisonnées en base (procedure_id), regroupées par
  // enfant, par type, et triées par date décroissante dans chaque type.
  const groupes = useMemo(() => {
    const docsProc = documents;

    const parEnfant = new Map<string | null, Document[]>();
    for (const d of docsProc) {
      const cle = d.child_id ?? null;
      if (!parEnfant.has(cle)) parEnfant.set(cle, []);
      parEnfant.get(cle)!.push(d);
    }
    // Ordre des groupes : les enfants dans leur ordre, puis "sans enfant" à la fin.
    const ordre: (string | null)[] = [];
    for (const e of enfants) if (parEnfant.has(e.id)) ordre.push(e.id);
    if (parEnfant.has(null)) ordre.push(null);

    return ordre.map((cle) => {
      const items = parEnfant.get(cle)!;
      const parType = new Map<string, Document[]>();
      for (const it of items) {
        if (!parType.has(it.categorie)) parType.set(it.categorie, []);
        parType.get(it.categorie)!.push(it);
      }
      const types = Array.from(parType.entries())
        .map(([type, docs]) => ({
          type,
          docs: docs.sort((a, b) =>
            (b.date_document ?? "").localeCompare(a.date_document ?? "")
          ),
        }))
        .sort((a, b) => a.type.localeCompare(b.type, "fr"));
      return { enfantId: cle, types };
    });
  }, [documents, enfants]);

  // Métriques pour Vue d'ensemble (dérivées depuis l'état déjà chargé).
  const compteParCategorie = CATEGORIES.map((cat) => ({
    label: cat,
    value: documents.filter((d) => d.categorie === cat).length,
  })).filter((c) => c.value > 0);
  const metriquesDocuments = [
    { label: "Total documents", value: documents.length, variant: "neutre" as const },
    ...compteParCategorie.slice(0, 3).map((c) => ({ label: c.label, value: c.value, variant: "neutre" as const })),
  ];

  async function envoyerDocument() {
    setMessage("");
    setConfirmation("");
    if (!libelle.trim()) return setMessage("Le libellé est obligatoire.");
    if (!fichier) return setMessage("Veuillez choisir un fichier.");

    setEnCours(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setMessage("Vous devez être connecté.");
        return;
      }

      // Cloisonnement : on résout la procédure AVANT l'upload pour ne pas
      // laisser de fichier orphelin si aucune procédure n'est active.
      const procedureId = await getProcedureActiveId();
      if (!procedureId) {
        setMessage(
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
        setMessage("Erreur d'envoi : " + uploadError.message);
        return;
      }

      // implication_categorie = null si non marqué (champ facultatif).
      const { error: insertError } = await supabase.from("documents").insert({
        libelle: libelle.trim(),
        categorie,
        chemin_fichier: chemin,
        date_document: dateDocument || null,
        child_id: childId || null,
        implication_categorie: implicationCategorie || null,
        procedure_id: procedureId,
      });
      if (insertError) {
        // Insertion échouée après l'upload : on retire le fichier orphelin.
        await supabase.storage.from("justificatifs").remove([chemin]);
        setMessage("Erreur d'enregistrement : " + insertError.message);
        return;
      }

      setLibelle(""); setCategorie("Autre"); setDateDocument("");
      setChildId(""); setImplicationCategorie(""); setFichier(null);
      (document.getElementById("champ-fichier") as HTMLInputElement).value = "";
      setConfirmation(
        "Pièce ajoutée. Elle apparaît dans la liste ci-dessous et peut être liée à un frais."
      );
      chargerDocuments();
    } finally {
      setEnCours(false);
    }
  }

  async function ouvrirDocument(chemin: string) {
    const { data, error } = await supabase.storage
      .from("justificatifs")
      .createSignedUrl(chemin, 60);
    if (error || !data) setMessage("Erreur : impossible d'ouvrir le fichier.");
    else window.open(data.signedUrl, "_blank");
  }

  async function archiverDocument(doc: Document) {
    setMessage("");
    const procId = await getProcedureActiveId();
    if (!procId) return;
    const { error } = await supabase
      .from("documents")
      .update({ etat: "archive" })
      .eq("id", doc.id)
      .eq("procedure_id", procId);
    if (error) { setMessage("Erreur : " + error.message); return; }
    setChoixId(null);
    chargerDocuments();
  }

  async function supprimerDocument(doc: Document) {
    setMessage("");
    // On retire d'abord le fichier ; si Storage échoue, on n'orpheline pas la
    // ligne en la supprimant quand même : on stoppe et on signale.
    const { error: erreurStorage } = await supabase.storage
      .from("justificatifs")
      .remove([doc.chemin_fichier]);
    if (erreurStorage) {
      setMessage("Erreur (fichier) : " + erreurStorage.message);
      return;
    }
    const procId = await getProcedureActiveId();
    if (!procId) return;
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id)
      .eq("procedure_id", procId);
    if (error) { setMessage("Erreur : " + error.message); return; }
    setChoixId(null);
    chargerDocuments();
  }

  function nomEnfant(id: string | null) {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  // Export CSV des pièces actives de la procédure active (ce qui est affiché à
  // l'écran). On aplatit les groupes pour conserver le même périmètre et le même
  // ordre (par enfant, par type, puis par date décroissante).
  function exporterCsv() {
    const enTete = ["Date", "Catégorie", "Libellé", "Enfant"];
    const lignes = groupes.flatMap((g) =>
      g.types.flatMap((t) =>
        t.docs.map((doc) => [
          doc.date_document ?? "",
          doc.categorie ?? "",
          doc.libelle ?? "",
          nomEnfant(doc.child_id) ?? "",
        ])
      )
    );
    const csv = construireCsv({
      enTete,
      lignes,
      contexte: { titre: "Documents et justificatifs (pièces actives)" },
    });
    const nomFichier = `documents-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <AppShell
      titre="Documents"
      description={isBoard10 ? "Importez rapidement une pièce ou un justificatif." : "Classez, consultez et vérifiez les pièces de la procédure."}
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/organiser" variant="secondary">
            Retour Organiser
          </AppButtonLink>
          <AppButtonLink href="/exporter/checklist" variant="secondary">
            Checklist export
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Hero Board10 ou métriques Vue d'ensemble */}
        {isBoard10 ? (
          <SecondaryHero
            titre="Action rapide"
            ctaLabel="Importer un document"
            ctaHref="#ajouter-document"
          />
        ) : (
          <SecondaryMetrics items={metriquesDocuments} />
        )}

        <div id="ajouter-document" />
        <p className="text-sm text-[var(--app-text-muted)]">
          Rangez ici vos justificatifs et pièces utiles (factures, certificats,
          captures, courriers). Pour une photo à horodater, utilisez plutôt{" "}
          <a href="/preuves" className="text-[var(--app-primary)] underline">
            Preuves photo
          </a>
          .
        </p>

        <p className="text-sm text-[var(--app-text-muted)]">
          Cette page affiche vos pièces actives.{" "}
          <a href="/documents/coffre-fort" className="text-[var(--app-primary)] underline">
            Voir toutes les pièces au coffre-fort
          </a>
          .
        </p>

        <div className="flex justify-end">
          <button
            onClick={exporterCsv}
            disabled={groupes.length === 0}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter en CSV
          </button>
        </div>

        <AppCard titre="Ajouter une pièce">
          <div className="space-y-4">
            <p className="text-sm text-[var(--app-text-muted)]">
              Ajoutez une pièce : justificatif (facture, certificat), capture d&apos;écran,
              courrier ou document personnel. Vous pourrez la lier à un frais ensuite.
            </p>

            <div>
              <label className="block text-sm font-medium text-[var(--app-text)]">
                Libellé <span className="text-[#9B2C2C]">*</span>
              </label>
              <input
                type="text" placeholder="Ex : Facture orthodontiste mars"
                value={libelle} onChange={(e) => setLibelle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--app-text)]">
                Fichier <span className="text-[#9B2C2C]">*</span>
              </label>
              <input
                id="champ-fichier"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm text-[var(--app-text-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--app-primary)] file:px-4 file:py-2 file:text-[var(--app-on-primary)]"
              />
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">Image ou PDF.</p>
            </div>

            {/* Détails non indispensables au premier enregistrement. */}
            <OptionsAvancees>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-[var(--app-text)]">Date du document</label>
                  <input
                    type="date" value={dateDocument}
                    onChange={(e) => setDateDocument(e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-[var(--app-text)]">
                  Implication parentale (facultatif)
                </label>
                <select
                  value={implicationCategorie}
                  onChange={(e) => setImplicationCategorie(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2"
                >
                  <option value="">- Non concerné -</option>
                  {CATEGORIES_IMPLICATION.map((c) => (
                    <option key={c.valeur} value={c.valeur}>{c.libelle}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                  À renseigner si cette pièce illustre une démarche concrète envers
                  l&apos;enfant (rendez-vous honoré, inscription, suivi...).
                </p>
              </div>
            </OptionsAvancees>

            <button
              onClick={envoyerDocument}
              disabled={enCours}
              className="rounded-lg bg-[var(--app-primary)] px-5 py-2 text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)] disabled:opacity-50"
            >
              {enCours ? "Envoi en cours..." : "Envoyer le document"}
            </button>
            <FormMessage message={message} type="erreur" />
          </div>
        </AppCard>

        {confirmation && (
          <div className="rounded-lg border border-[var(--app-success,#2e6a4d)]/30 bg-[var(--app-success-soft,rgba(46,106,77,0.08))] px-4 py-3">
            <FormMessage message={confirmation} type="succes" />
          </div>
        )}

        <AppNotice titre="Rappel">
          <p>
            Les fichiers sont liés à la procédure active. Vérifiez les libellés
            et les dates avant tout export ou transmission.
          </p>
        </AppNotice>

        {/* Liste classée par enfant, puis par type, puis par date décroissante */}
        <AppCard titre="Pièces actives">
          <div className="space-y-8">
            {groupes.length === 0 && (
              <EmptyState
                titre="Aucune pièce active pour cette procédure"
                message="Ajoutez un justificatif ou une pièce avec le formulaire ci-dessus."
              />
            )}

            {groupes.map((groupe) => (
              <div key={groupe.enfantId ?? "sans-enfant"} className="space-y-4">
                <h2 className="border-b border-[var(--app-border)] pb-1 text-base font-semibold text-[var(--app-text)]">
                  {nomEnfant(groupe.enfantId) ?? "Pièces sans enfant rattaché"}
                </h2>

                {groupe.types.map((t) => (
                  <div key={t.type} className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-text-muted)]">
                      {t.type}
                    </p>

                    {t.docs.map((doc) => {
                      const implication = libelleImplication(doc.implication_categorie);
                      return (
                        <div key={doc.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-[var(--app-text)]">{doc.libelle}</p>
                              <p className="text-sm text-[var(--app-text-muted)]">
                                {doc.date_document ?? "Sans date"}
                              </p>
                              {implication && (
                                <span className="mt-2 inline-block rounded-full border border-[var(--app-accent)]/40 bg-[var(--app-accent-soft)] px-2.5 py-0.5 text-xs text-[var(--app-accent)]">
                                  Implication : {implication}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => ouvrirDocument(doc.chemin_fichier)}
                                className="text-sm text-[var(--app-text)] hover:underline"
                              >
                                Ouvrir
                              </button>
                              {choixId !== doc.id && (
                                <button
                                  onClick={() => setChoixId(doc.id)}
                                  className="text-sm text-[var(--app-text)] hover:underline"
                                >
                                  Retirer
                                </button>
                              )}
                            </div>
                          </div>

                          {choixId === doc.id && (
                            <div className="mt-4 rounded-lg bg-[var(--app-surface-muted)] p-3">
                              <p className="text-sm text-[var(--app-text)]">
                                Voulez-vous conserver cette pièce au coffre-fort, ou la supprimer
                                définitivement ?
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => archiverDocument(doc)}
                                  className="rounded-lg bg-[var(--app-success,#2e6a4d)] px-3 py-1.5 text-sm text-white hover:bg-[#27583f]"
                                >
                                  Conserver au coffre-fort
                                </button>
                                <button
                                  onClick={() => supprimerDocument(doc)}
                                  className="rounded-lg bg-[var(--app-danger,#9b2c2c)] px-3 py-1.5 text-sm text-white hover:bg-[#822525]"
                                >
                                  Supprimer définitivement
                                </button>
                                <button
                                  onClick={() => setChoixId(null)}
                                  className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </AppCard>

        {/* Aide contextuelle — visible uniquement en mode guided */}
        <HomeGuidedHint>
          Ajoutez vos pièces dès que vous les recevez (facture, courrier, jugement).
          Vous pourrez les lier à un frais ou à un fait du journal depuis les autres pages.
          Les pièces restent privées et ne sont jamais envoyées automatiquement.
        </HomeGuidedHint>
      </div>
    </AppShell>
  );
}
