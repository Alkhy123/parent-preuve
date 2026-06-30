"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { euros } from "@/lib/dossierCalculs";
import Modale from "@/components/ui/Modale";
import type { TimelineItem } from "@/lib/timeline/types";
import { SOURCES_TIMELINE } from "@/components/timeline/FiltresTimeline";
import {
  evaluerQualiteDoc,
  badgeQualite,
  type ElementDoc,
} from "@/lib/ux/qualiteDocumentaire";
import {
  chargerDetailItem,
  changerStatutFait,
  supprimerFait,
  basculerRemboursementFrais,
  supprimerFrais,
  supprimerPension,
  archiverDocument,
  supprimerDocument,
  urlSigneeDocument,
  urlSigneeJustificatifFrais,
  urlSigneePreuve,
  type DetailItem,
  type ResultatAction,
} from "@/lib/timeline/detailItem";

type Props = {
  item: TimelineItem | null;
  onFermer: () => void;
  onRecharger: () => void;
  nomEnfant: (id: string | null | undefined) => string | null;
};

// "AAAA-MM-JJ" -> "JJ/MM/AAAA"
function dateFr(d: string | null): string {
  if (!d) return "Sans date";
  const [a, m, j] = d.slice(0, 10).split("-");
  return j && m && a ? `${j}/${m}/${a}` : d;
}

// Statut d'un fait -> badge sobre.
function badgeFait(statut: string | null): { texte: string; classe: string } {
  if (statut === "valide") return { texte: "Validé", classe: "badge badge-succes" };
  if (statut === "exporte") return { texte: "Exporté", classe: "badge badge-neutre" };
  return { texte: "Brouillon", classe: "badge badge-attention" };
}

// Statut factuel d'un mois de pension (même logique que la page pension).
function statutPension(du: number, paye: number): { texte: string; classe: string } {
  if (paye >= du && du > 0) return { texte: "Payé", classe: "badge badge-succes" };
  if (paye > 0 && paye < du) return { texte: "Partiel", classe: "badge badge-attention" };
  return { texte: "Impayé", classe: "badge badge-erreur" };
}

// Petite ligne "label : valeur".
function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-sm text-[var(--app-text-muted)]">
      <span className="text-[var(--app-text-muted)]">{label} : </span>
      <span className="text-[var(--app-text)]">{children}</span>
    </p>
  );
}

// Traduit un détail en descripteur de qualité documentaire.
// Renvoie null pour les sources qu'on n'évalue pas (la pièce/preuve EST une
// pièce ; la règle de garde n'est pas un élément documentaire à compléter).
// Un critère mis à null est « non applicable » : il ne pénalise pas.
function descripteurQualite(detail: DetailItem): ElementDoc | null {
  switch (detail.source) {
    case "journal":
      return {
        date: !!detail.date_evenement,
        description: !!detail.description_factuelle?.trim(),
        pieceLiee: !!detail.document_id,
        enfant: detail.child_id ? true : null, // « général » non pénalisé
      };
    case "frais":
      return {
        date: !!detail.date_frais,
        montant: detail.montant != null,
        // Pièce non applicable si l'absence a été choisie explicitement.
        pieceLiee: detail.document_id
          ? true
          : detail.sans_justificatif
            ? null
            : false,
        enfant: detail.child_id ? true : null,
      };
    case "pension":
      return {
        date: !!detail.mois_du,
        montant: detail.montant_du != null,
        description: detail.notes?.trim() ? true : null, // note facultative
      };
    default:
      return null; // document, preuve, garde : pas de score documentaire
  }
}

export default function DetailTimelineItem({
  item,
  onFermer,
  onRecharger,
  nomEnfant,
}: Props) {
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [chargement, setChargement] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState(false);

  const charger = useCallback(async () => {
    if (!item) return;
    setChargement(true);
    setErreur("");
    const d = await chargerDetailItem(item.source, item.id);
    setDetail(d);
    setChargement(false);
  }, [item]);

  useEffect(() => {
    // Réinitialise l'état d'affichage à chaque changement d'item ouvert.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfirmSuppr(false);
    setDetail(null);
    setErreur("");
    if (item) charger();
  }, [item, charger]);

  // Lance une action d'écriture ; rafraîchit la timeline et le détail (ou ferme).
  async function lancer(
    fn: () => Promise<ResultatAction>,
    options?: { ferme?: boolean },
  ) {
    setBusy(true);
    setErreur("");
    const { error } = await fn();
    setBusy(false);
    if (error) {
      setErreur(error);
      return;
    }
    onRecharger();
    if (options?.ferme) onFermer();
    else charger();
  }

  // Ouvre un fichier via une URL signée temporaire.
  async function ouvrir(fn: () => Promise<string | null>) {
    setBusy(true);
    setErreur("");
    const url = await fn();
    setBusy(false);
    if (!url) {
      setErreur("Fichier introuvable ou inaccessible.");
      return;
    }
    window.open(url, "_blank");
  }

  const meta = item ? SOURCES_TIMELINE.find((s) => s.cle === item.source) : null;
  const titre = item?.titre ?? "Détail";

  // Qualité documentaire (lecture seule) de l'élément ouvert, si applicable.
  const descripteur = detail ? descripteurQualite(detail) : null;
  const qualite = descripteur ? evaluerQualiteDoc(descripteur) : null;

  // Bloc de confirmation de suppression, réutilisé par les sources concernées.
  function confirmationSuppression(fn: () => Promise<ResultatAction>) {
    return (
      <div className="mt-3 rounded-lg bg-slate-100 p-3">
        <p className="text-sm text-[var(--app-text)]">
          Confirmer la suppression définitive de cet élément ?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => lancer(fn, { ferme: true })}
            className="btn bg-red-700 text-white hover:bg-red-800"
          >
            Supprimer définitivement
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmSuppr(false)}
            className="btn text-[var(--app-text-muted)] hover:bg-black/5 hover:text-[var(--app-text)]"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  function corps() {
    if (chargement) return <p className="text-[var(--app-text-muted)]">Chargement…</p>;
    if (!detail) {
      return (
        <p className="text-[var(--app-text-muted)]">
          Élément introuvable. Il a peut-être été supprimé.
        </p>
      );
    }

    switch (detail.source) {
      case "journal": {
        const badge = badgeFait(detail.statut);
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {detail.categorie && (
                <span className="badge badge-neutre">{detail.categorie}</span>
              )}
              <span className={badge.classe}>{badge.texte}</span>
            </div>
            <Ligne label="Date">
              {dateFr(detail.date_evenement)}
              {detail.heure_evenement ? ` à ${detail.heure_evenement.slice(0, 5)}` : ""}
            </Ligne>
            {nomEnfant(detail.child_id) && (
              <Ligne label="Enfant">{nomEnfant(detail.child_id)}</Ligne>
            )}
            {detail.description_factuelle && (
              <p className="text-sm text-[var(--app-text)]">{detail.description_factuelle}</p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {detail.statut !== "valide" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => lancer(() => changerStatutFait(detail.id, "valide"))}
                  className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
                >
                  Marquer comme validé
                </button>
              )}
              {detail.statut !== "brouillon" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => lancer(() => changerStatutFait(detail.id, "brouillon"))}
                  className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
                >
                  Repasser en brouillon
                </button>
              )}
            </div>

            {confirmSuppr ? (
              confirmationSuppression(() => supprimerFait(detail.id))
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmSuppr(true)}
                className="btn text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                Supprimer
              </button>
            )}

            <Link href="/journal" className="block pt-1 text-sm text-or-fonce underline">
              Ouvrir dans le journal
            </Link>
          </div>
        );
      }

      case "frais": {
        const rembourse = detail.rembourse === true;
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {detail.categorie && (
                <span className="badge badge-neutre">{detail.categorie}</span>
              )}
              <span className={rembourse ? "badge badge-succes" : "badge badge-erreur"}>
                {rembourse ? "Remboursé" : "Non remboursé"}
              </span>
            </div>
            <Ligne label="Date">{dateFr(detail.date_frais)}</Ligne>
            {detail.montant != null && (
              <Ligne label="Montant total">{euros(Number(detail.montant))}</Ligne>
            )}
            {detail.part_autre != null && (
              <Ligne label="Part due">{euros(Number(detail.part_autre))}</Ligne>
            )}
            {nomEnfant(detail.child_id) && (
              <Ligne label="Enfant">{nomEnfant(detail.child_id)}</Ligne>
            )}
            <Ligne label="Justificatif">
              {detail.document_id ? "Joint" : "Aucun"}
            </Ligne>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  lancer(() => basculerRemboursementFrais(detail.id, detail.rembourse))
                }
                className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
              >
                {rembourse ? "Annuler le remboursement" : "Marquer remboursé"}
              </button>
              {detail.document_id && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => ouvrir(() => urlSigneeJustificatifFrais(detail.document_id))}
                  className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
                >
                  Ouvrir le justificatif
                </button>
              )}
            </div>

            {confirmSuppr ? (
              confirmationSuppression(() => supprimerFrais(detail.id))
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmSuppr(true)}
                className="btn text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                Supprimer
              </button>
            )}

            <Link href="/frais" className="block pt-1 text-sm text-or-fonce underline">
              Modifier dans la page Frais
            </Link>
          </div>
        );
      }

      case "pension": {
        const du = Number(detail.montant_du ?? 0);
        const paye = Number(detail.montant_paye ?? 0);
        const badge = statutPension(du, paye);
        return (
          <div className="space-y-3">
            <span className={badge.classe}>{badge.texte}</span>
            <Ligne label="Mois">{dateFr(detail.mois_du)}</Ligne>
            <Ligne label="Dû">{euros(du)}</Ligne>
            <Ligne label="Payé">
              {euros(paye)}
              {detail.date_paiement ? ` le ${dateFr(detail.date_paiement)}` : ""}
            </Ligne>
            {detail.notes && <Ligne label="Notes">{detail.notes}</Ligne>}

            {confirmSuppr ? (
              confirmationSuppression(() => supprimerPension(detail.id))
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmSuppr(true)}
                className="btn text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                Supprimer ce mois
              </button>
            )}

            <Link href="/pension" className="block pt-1 text-sm text-or-fonce underline">
              Ouvrir le suivi pension
            </Link>
          </div>
        );
      }

      case "document": {
        const actif = detail.etat === "actif";
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {detail.categorie && (
                <span className="badge badge-neutre">{detail.categorie}</span>
              )}
              <span className={actif ? "badge badge-info" : "badge badge-neutre"}>
                {actif ? "Pièce active" : "Au coffre-fort"}
              </span>
            </div>
            <Ligne label="Date">{dateFr(detail.date_document)}</Ligne>
            {nomEnfant(detail.child_id) && (
              <Ligne label="Enfant">{nomEnfant(detail.child_id)}</Ligne>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={() => ouvrir(() => urlSigneeDocument(detail.chemin_fichier))}
                className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
              >
                Ouvrir le fichier
              </button>
              {actif && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => lancer(() => archiverDocument(detail.id))}
                  className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
                >
                  Conserver au coffre-fort
                </button>
              )}
            </div>

            {confirmSuppr ? (
              confirmationSuppression(() =>
                supprimerDocument(detail.id, detail.chemin_fichier),
              )
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmSuppr(true)}
                className="btn text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                Supprimer définitivement
              </button>
            )}

            <Link href="/documents" className="block pt-1 text-sm text-or-fonce underline">
              Ouvrir la page Documents
            </Link>
          </div>
        );
      }

      case "preuve": {
        return (
          <div className="space-y-3">
            <Ligne label="Scellée le">{dateFr(detail.created_at)}</Ligne>
            {nomEnfant(detail.enfant_id) && (
              <Ligne label="Enfant">{nomEnfant(detail.enfant_id)}</Ligne>
            )}
            {detail.nom_fichier && <Ligne label="Fichier">{detail.nom_fichier}</Ligne>}
            {detail.description && (
              <p className="text-sm text-[var(--app-text)]">{detail.description}</p>
            )}

            {detail.storage_path && (
              <button
                type="button"
                disabled={busy}
                onClick={() => ouvrir(() => urlSigneePreuve(detail.storage_path))}
                className="btn bg-[var(--app-text)] text-[var(--app-surface)] hover:opacity-90"
              >
                Voir l&apos;original
              </button>
            )}

            <p className="pt-1 text-xs text-[var(--app-text-muted)]">
              Preuve numérique renforcée, scellée et horodatée. Horodatage non
              qualifié : ce n&apos;est pas un constat de commissaire de justice.
            </p>

            <Link href="/preuves" className="block text-sm text-or-fonce underline">
              Ouvrir la fiche preuve (rapport PDF)
            </Link>
          </div>
        );
      }

      case "garde": {
        return (
          <div className="space-y-3">
            <Ligne label="Date de référence">{dateFr(detail.date_reference)}</Ligne>
            {nomEnfant(detail.enfant_id) && (
              <Ligne label="Enfant">{nomEnfant(detail.enfant_id)}</Ligne>
            )}
            {detail.notes && <Ligne label="Notes">{detail.notes}</Ligne>}

            <Link href="/calendrier" className="block pt-1 text-sm text-or-fonce underline">
              Ouvrir le calendrier de garde
            </Link>
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <Modale ouverte={item !== null} onFermer={onFermer} titre={titre}>
      {meta && (
        <p className="mb-3 -mt-2">
          <span className="badge badge-info">{meta.libelle}</span>
        </p>
      )}
      {qualite && (
        <div className="mb-3">
          <span className={badgeQualite(qualite.niveau).classe}>
            {badgeQualite(qualite.niveau).label}
          </span>
          {qualite.manquants.length > 0 && (
            <p className="mt-1 text-xs text-[var(--app-text-muted)]">
              À compléter : {qualite.manquants.join(", ")}.
            </p>
          )}
        </div>
      )}
      {corps()}
      {erreur && <p className="mt-3 text-sm text-rouge">{erreur}</p>}
    </Modale>
  );
}
