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
import ReglePension from "@/components/ReglePension";
import { euros } from "@/lib/dossierCalculs";
import { getProcedureActiveId } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";
import {
  nettoyerProposition,
  CLE_SESSION_PREREMPLISSAGE,
} from "@/lib/preRemplissage";

type Paiement = {
  id: string;
  mois_du: string;
  montant_du: number;
  montant_paye: number;
  date_paiement: string | null;
  notes: string | null;
};

// Affiche "2026-06-01" comme "juin 2026"
function moisLisible(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

// Décide du statut d'un mois à partir des faits
function statut(p: Paiement): { texte: string; classe: string } {
  const du = Number(p.montant_du);
  const paye = Number(p.montant_paye);

  if (paye >= du && du > 0) return { texte: "Payé", classe: "bg-green-100 text-green-700" };
  if (paye > 0 && paye < du) return { texte: "Partiel", classe: "bg-amber-100 text-amber-700" };

  // Rien (ou presque) payé : impayé. En retard si le mois est déjà passé.
  const finDuMois = new Date(p.mois_du);
  finDuMois.setMonth(finDuMois.getMonth() + 1); // début du mois suivant
  const enRetard = new Date() > finDuMois;
  return enRetard
    ? { texte: "En retard", classe: "bg-red-100 text-red-700" }
    : { texte: "À venir", classe: "bg-slate-100 text-slate-600" };
}

export default function PensionPage() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [procedureId, setProcedureId] = useState<string | null>(null);

  const [mois, setMois] = useState("");        // format "2026-06" (champ month)
  const [montantDu, setMontantDu] = useState("");
  const [montantPaye, setMontantPaye] = useState("");
  const [datePaiement, setDatePaiement] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [signalAjout, setSignalAjout] = useState(0);

  // Édition d'un mois existant. null = mode ajout ; sinon l'id du mois modifié.
  const [editionId, setEditionId] = useState<string | null>(null);
  const formulaireRef = useRef<HTMLDivElement>(null);

  // Pré-remplissage proposé par le copilote (lecture seule, à VÉRIFIER avant ajout).
  // preRempli ouvre le formulaire ; avertissements sont des notes neutres
  // signalant une incertitude (mois supposé, montant attendu manquant, etc.).
  const [preRempli, setPreRempli] = useState(false);
  const [avertissements, setAvertissements] = useState<string[]>([]);

  async function chargerPaiements() {
    const procId = await getProcedureActiveId();
    setProcedureId(procId);

    if (!procId) {
      setPaiements([]);
      return;
    }

    const { data, error } = await supabase
      .from("pension_payments")
      .select("id, mois_du, montant_du, montant_paye, date_paiement, notes")
      .eq("procedure_id", procId)
      .order("mois_du", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setPaiements(data ?? []);
  }

  useEffect(() => {
    // Chargement async (setState après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerPaiements();
  }, []);

  // Au montage : lit UNE FOIS un éventuel pré-remplissage déposé par le copilote,
  // puis efface la clé (usage unique). Le serveur a déjà verrouillé la sortie ;
  // on la repasse quand même par nettoyerProposition() par sécurité.
  // On n'agit que sur une proposition de type "pension".
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
    if (proposition.type !== "pension") return;

    const c = proposition.champs;
    // Pré-remplissage one-shot lu au montage (pas de cascade de rendu).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c.mois !== null) setMois(c.mois);
    if (c.montant_du !== null) setMontantDu(String(c.montant_du));
    if (c.montant_paye !== null) setMontantPaye(String(c.montant_paye));
    if (c.date_paiement !== null) setDatePaiement(c.date_paiement);
    setAvertissements(proposition.avertissements);
    setPreRempli(true);
  }, []);

  async function enregistrerMois() {
    setMessage("");
    setConfirmation("");
    if (!mois) return setMessage("Le mois est obligatoire.");
    const duNum = parseFloat(montantDu.replace(",", "."));
    if (isNaN(duNum)) return setMessage("Le montant attendu doit être un nombre.");
    const payeNum = montantPaye.trim() ? parseFloat(montantPaye.replace(",", ".")) : 0;

    if (!procedureId) {
      return setMessage("Aucune procédure active. Ajoutez d'abord un enfant dans « Mes enfants ».");
    }

    const payload = {
      mois_du: mois + "-01", // on stocke le 1er du mois
      montant_du: duNum,
      montant_paye: isNaN(payeNum) ? 0 : payeNum,
      date_paiement: datePaiement || null,
      notes: notes.trim() || null,
      procedure_id: procedureId,
    };

    // Anti-doublon : un seul enregistrement par mois et par procédure.
    // On cherche un mois identique (hors la ligne en cours d'édition).
    const existant = paiements.find(
      (p) => p.mois_du.slice(0, 7) === mois && p.id !== editionId
    );

    let error = null;
    let confirmationTexte = "";
    if (existant && !editionId) {
      // Ajout sur un mois déjà présent : on met à jour la ligne existante au
      // lieu de créer un doublon (source unique par mois et par procédure).
      const r = await supabase.from("pension_payments").update(payload).eq("id", existant.id);
      error = r.error;
      confirmationTexte = "Ce mois existait déjà : il a été mis à jour.";
    } else if (existant && editionId) {
      // Édition vers un mois déjà occupé par une AUTRE ligne : on refuse.
      return setMessage("Un paiement existe déjà pour ce mois. Modifiez-le directement.");
    } else if (editionId) {
      const r = await supabase.from("pension_payments").update(payload).eq("id", editionId);
      error = r.error;
      confirmationTexte = "Mois modifié.";
    } else {
      const r = await supabase.from("pension_payments").insert(payload);
      error = r.error;
      confirmationTexte =
        "Mois enregistré. Le statut (payé, partiel, en retard) est calculé automatiquement.";
    }

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setEditionId(null);
      setMois(""); setMontantDu(""); setMontantPaye(""); setDatePaiement(""); setNotes("");
      // Fin du cycle de pré-remplissage : on retire le bandeau et on referme.
      setPreRempli(false); setAvertissements([]);
      setConfirmation(confirmationTexte);
      setSignalAjout((n) => n + 1);
      chargerPaiements();
    }
  }

  // Charge un mois existant dans le formulaire pour le modifier.
  function chargerPourEdition(p: Paiement) {
    setMessage("");
    setConfirmation("");
    setEditionId(p.id);
    setMois(p.mois_du.slice(0, 7));
    setMontantDu(String(p.montant_du ?? ""));
    setMontantPaye(String(p.montant_paye ?? ""));
    setDatePaiement(p.date_paiement ?? "");
    setNotes(p.notes ?? "");
    // Pré-remplissage éventuel : on l'efface pour ne pas mélanger les bandeaux.
    setPreRempli(false); setAvertissements([]);
    formulaireRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Quitte l'édition sans enregistrer et vide le formulaire.
  function annulerEdition() {
    setEditionId(null);
    setMessage("");
    setMois(""); setMontantDu(""); setMontantPaye(""); setDatePaiement(""); setNotes("");
  }

  // Action rapide : enregistre le mois comme intégralement payé.
  // montant_paye = montant_du ; on conserve la date de réception si déjà saisie.
  async function marquerPayeEnEntier(p: Paiement) {
    setMessage("");
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("pension_payments")
      .update({
        montant_paye: p.montant_du,
        date_paiement: p.date_paiement ?? aujourdHui,
      })
      .eq("id", p.id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerPaiements();
  }

  async function supprimerPaiement(id: string) {
    const { error } = await supabase.from("pension_payments").delete().eq("id", id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerPaiements();
  }

  // Total encore dû (somme des manques sur tous les mois)
  const totalDu = paiements.reduce(
    (s, p) => s + Math.max(0, Number(p.montant_du) - Number(p.montant_paye)),
    0
  );

  // Export CSV des paiements de la procédure active (ce qui est affiché à l'écran).
  // Données factuelles uniquement : aucun jugement, aucune qualification.
  function exporterCsv() {
    const enTete = [
      "Mois",
      "Montant dû",
      "Montant payé",
      "Reste dû",
      "Statut",
      "Date de paiement",
      "Notes",
    ];
    const lignes = paiements.map((p) => {
      const resteDu = Math.max(0, Number(p.montant_du) - Number(p.montant_paye));
      return [
        moisLisible(p.mois_du),
        euros(Number(p.montant_du)),
        euros(Number(p.montant_paye)),
        euros(resteDu),
        statut(p).texte,
        p.date_paiement ?? "",
        p.notes ?? "",
      ];
    });
    const csv = construireCsv({
      enTete,
      lignes,
      contexte: { titre: "Pension alimentaire" },
    });
    const nomFichier = `pension-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <AppShell
      titre="Pension"
      description="Suivre les montants dus, les paiements recus et les ecarts mois par mois."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/collecter" variant="secondary">
            Retour à Collecter
          </AppButtonLink>
          <AppButtonLink href="/resume-mois" variant="secondary">
            Résumé du mois
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <ReglePension />

        <AppCard titre="Total restant dû">
          <p className="text-sm text-[var(--app-text-muted)]">
            Tous mois confondus, procédure active
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--app-text)]">
            {euros(totalDu)}
          </p>
        </AppCard>

        <div className="flex justify-end">
          <button
            onClick={exporterCsv}
            disabled={paiements.length === 0}
            className="rounded-lg border border-[var(--app-border)] bg-white px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter en CSV
          </button>
        </div>

        {/* Formulaire. La clé force l'ouverture de l'encart quand un
            pré-remplissage arrive (sans modifier le composant partagé). */}
        <div ref={formulaireRef}>
          <EncartPliable
            key={editionId ? `pension-edition-${editionId}` : preRempli ? "pension-prerempli" : "pension-standard"}
            titre={editionId ? "Modifier le mois" : "Ajouter un paiement"}
            replieParDefaut={!preRempli && !editionId}
            signalFermeture={signalAjout}
          >
            <div className="space-y-4">
              {preRempli && (
                <AppNotice titre="Proposition pré-remplie à vérifier">
                  <p>
                    Vérifiez chaque champ, complétez le montant attendu si besoin,
                    puis cliquez sur « Enregistrer le mois » pour valider
                    vous-même l&apos;enregistrement.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#15233F]">
                    Mois concerné <span className="text-[#9B2C2C]">*</span>
                  </label>
                  <input
                    type="month" value={mois}
                    onChange={(e) => setMois(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2 bg-white text-[var(--app-text)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#15233F]">
                    Montant attendu (€) <span className="text-[#9B2C2C]">*</span>
                  </label>
                  <input
                    type="text" inputMode="decimal" placeholder="300"
                    value={montantDu} onChange={(e) => setMontantDu(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2 bg-white text-[var(--app-text)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#15233F]">Montant reçu (€)</label>
                  <input
                    type="text" inputMode="decimal" placeholder="0 si rien reçu"
                    value={montantPaye} onChange={(e) => setMontantPaye(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2 bg-white text-[var(--app-text)]"
                  />
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                    Indiquez ce qui a réellement été reçu. Un paiement partiel ou un
                    retard est simplement constaté, sans interprétation.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#15233F]">Date de réception (facultatif)</label>
                  <input
                    type="date" value={datePaiement}
                    onChange={(e) => setDatePaiement(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2 bg-white text-[var(--app-text)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#15233F]">Note (facultatif)</label>
                <textarea
                  rows={2} value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex : virement partiel, paiement en espèces..."
                  className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2 bg-white text-[var(--app-text)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={enregistrerMois}
                  className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#15233F]/90"
                >
                  {editionId ? "Enregistrer les modifications" : "Enregistrer le mois"}
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
          <div className="rounded-lg border border-[#2E6A4D]/30 bg-[#2E6A4D]/5 px-4 py-3">
            <FormMessage message={confirmation} type="succes" />
          </div>
        )}

        <AppNotice titre="Rappel">
          <p>
            Les montants affichés sont issus de vos saisies. Vérifiez-les avant
            tout usage ou export.
          </p>
        </AppNotice>

        {/* Liste */}
        <AppCard>
          <div className="space-y-3">
            {paiements.length === 0 && (
              <EmptyState
                titre="Aucun mois enregistré"
                message="Enregistrez un premier mois avec « Ajouter un paiement » ci-dessus."
              />
            )}
            {paiements.map((p) => {
              const s = statut(p);
              const resteDu = Math.max(0, Number(p.montant_du) - Number(p.montant_paye));
              return (
                <div key={p.id} className="rounded-xl border border-[var(--app-border)] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold capitalize text-[var(--app-text)]">
                          {moisLisible(p.mois_du)}
                        </p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.classe}`}>
                          {s.texte}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                        Attendu {euros(Number(p.montant_du))} · reçu {euros(Number(p.montant_paye))}
                        {p.date_paiement ? ` le ${p.date_paiement}` : ""}
                      </p>
                      {resteDu > 0 && (
                        <p className="mt-0.5 text-sm font-medium text-[#9B2C2C]">
                          Reste dû {euros(resteDu)}
                        </p>
                      )}
                      {p.notes && (
                        <p className="mt-1 text-sm text-[var(--app-text-muted)]">{p.notes}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <button
                        onClick={() => chargerPourEdition(p)}
                        className="text-sm text-[var(--app-text)] hover:underline"
                      >
                        Modifier
                      </button>
                      {resteDu > 0 && (
                        <button
                          onClick={() => marquerPayeEnEntier(p)}
                          className="text-sm text-[var(--app-text)] hover:underline"
                        >
                          Marquer payé en entier
                        </button>
                      )}
                      <button
                        onClick={() => supprimerPaiement(p.id)}
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
        </AppCard>
      </div>
    </AppShell>
  );
}
