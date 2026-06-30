"use client";

import { useEffect, useState } from "react";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import OptionsAvancees from "@/components/ui/OptionsAvancees";
import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import { journaliserAction } from "@/lib/auditLog";
import { exporterPreuvePdf } from "@/lib/preuvePdf";
import { getEnfantsDeProcedureActive, getProcedureActiveId } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";

type Preuve = {
  id: string;
  created_at: string;
  titre: string | null;
  description: string | null;
  enfant_id: string | null;
  nom_fichier: string | null;
  type_fichier: string | null;
  taille_octets: number | null;
  empreinte_sha256: string | null;
  empreinte_sha256_serveur: string | null;
  hash_verifie: boolean | null;
  storage_path: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_precision_metres: number | null;
  ecart_heure_secondes: number | null;
  heure_appareil: string | null;
  horodatage_jeton: string | null;
  horodatage_date: string | null;
  horodatage_statut: string | null;
  horodatage_prestataire: string | null;
  horodatage_algorithme: string | null;
};

type Enfant = {
  id: string;
  prenom_ou_alias: string | null;
};

function dateHeureFr(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function blobVersImage(
    blob: Blob
  ): Promise<{ dataUrl: string; w: number; h: number } | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          const maxPx = 1600; // on réduit pour ne pas alourdir le PDF
          if (Math.max(w, h) > maxPx) {
            const r = maxPx / Math.max(w, h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          URL.revokeObjectURL(url);
          resolve({ dataUrl, w, h });
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

// Pastille de statut d'horodatage (repère visuel dans la liste).
function pastilleHorodatage(
  statut: string | null
): { label: string; classes: string } | null {
  if (statut === "non_qualifie")
    return {
      label: "✓ horodaté",
      classes: "bg-green-50 text-green-700 border-green-200",
    };
  if (statut === "qualifie")
    return {
      label: "✓ horodaté (qualifié)",
      classes: "bg-green-50 text-green-700 border-green-200",
    };
  if (statut === "a_refaire")
    return {
      label: "⚠ horodatage à refaire",
      classes: "bg-orange-50 text-orange-700 border-orange-200",
    };
  return null; // anciennes preuves sans horodatage : on n'affiche rien
}

export default function PreuvesPage() {
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [chargement, setChargement] = useState(true);

  const [genEnCours, setGenEnCours] = useState<string | null>(null);

  // Action technique en cours (clé "id:horodatage" ou "id:hash") + retour par preuve.
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [retour, setRetour] = useState<Record<string, string>>({});

  // Relancer l'horodatage interne (non qualifié) d'une preuve marquée "à refaire".
  // /api/horodatage signe l'empreinte mais n'écrit rien : on persiste les champs ici.
  async function relancerHorodatage(p: Preuve) {
    if (!p.empreinte_sha256) return;
    setActionEnCours(`${p.id}:horodatage`);
    setRetour((r) => ({ ...r, [p.id]: "" }));
    try {
      const reponse = await fetch("/api/horodatage", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ empreinte: p.empreinte_sha256 }),
      });
      if (!reponse.ok) throw new Error("réponse non OK");
      const h = await reponse.json();
      // Cloisonnement : l'update est borné à la procédure active (avec la RLS).
      const procId = await getProcedureActiveId();
      if (!procId) throw new Error("Aucune procédure active.");
      const { error } = await supabase
        .from("preuves_photo")
        .update({
          horodatage_jeton: h.jeton,
          horodatage_date: h.date,
          horodatage_statut: h.statut,
          horodatage_prestataire: h.prestataire,
          horodatage_algorithme: h.algorithme,
        })
        .eq("id", p.id)
        .eq("procedure_id", procId);
      if (error) throw error;
      // Reflète le nouvel état dans la liste (pastille + colonnes affichées).
      setPreuves((liste) =>
        liste.map((x) =>
          x.id === p.id
            ? { ...x, horodatage_statut: h.statut, horodatage_date: h.date }
            : x
        )
      );
      setRetour((r) => ({ ...r, [p.id]: "Horodatage refait." }));
      void journaliserAction("preuve.horodatage", {
        cibleType: "preuve_photo",
        cibleId: p.id,
      });
    } catch {
      setRetour((r) => ({
        ...r,
        [p.id]: "Échec de l'horodatage. Réessayez plus tard.",
      }));
    } finally {
      setActionEnCours(null);
    }
  }

  // Relancer la vérification serveur de l'empreinte (intégrité technique).
  // /api/preuves/verifier-hash recharge le fichier, recalcule et enregistre lui-même.
  async function relancerVerificationHash(p: Preuve) {
    if (!p.storage_path || !p.empreinte_sha256) return;
    setActionEnCours(`${p.id}:hash`);
    setRetour((r) => ({ ...r, [p.id]: "" }));
    try {
      const reponse = await fetch("/api/preuves/verifier-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ id: p.id }),
      });
      if (!reponse.ok) throw new Error("réponse non OK");
      const v = await reponse.json();
      setRetour((r) => ({
        ...r,
        [p.id]: v.hash_verifie
          ? "Intégrité vérifiée : empreinte recalculée concordante."
          : "Écart constaté entre l'empreinte d'origine et l'empreinte recalculée.",
      }));
      void journaliserAction("preuve.verification_hash", {
        cibleType: "preuve_photo",
        cibleId: p.id,
        metadonnees: { concordant: Boolean(v.hash_verifie) },
      });
    } catch {
      setRetour((r) => ({
        ...r,
        [p.id]: "Vérification indisponible. Réessayez plus tard.",
      }));
    } finally {
      setActionEnCours(null);
    }
  }

  async function genererRapport(p: Preuve) {
    setGenEnCours(p.id);
    try {
      // La liste ne porte que les colonnes d'affichage : on recharge la ligne
      // complète (champs techniques du rapport) ; repli sur p en cas d'échec.
      const { data: complet } = await supabase
        .from("preuves_photo")
        .select("*")
        .eq("id", p.id)
        .single();
      const d = (complet ?? p) as Preuve;

      let image: { dataUrl: string; w: number; h: number } | null = null;
      if (d.storage_path) {
        const { data } = await supabase.storage
          .from("preuves")
          .download(d.storage_path);
        if (data) image = await blobVersImage(data);
      }
      exporterPreuvePdf(
        {
          titre: d.titre,
          description: d.description,
          nom_enfant: nomEnfant(d.enfant_id),
          created_at: d.created_at,
          nom_fichier: d.nom_fichier,
          type_fichier: d.type_fichier,
          taille_octets: d.taille_octets,
          empreinte_sha256: d.empreinte_sha256,
          empreinte_sha256_serveur: d.empreinte_sha256_serveur,
          hash_verifie: d.hash_verifie,
          heure_appareil: d.heure_appareil,
          ecart_heure_secondes: d.ecart_heure_secondes,
          gps_latitude: d.gps_latitude,
          gps_longitude: d.gps_longitude,
          gps_precision_metres: d.gps_precision_metres,
          horodatage_jeton: d.horodatage_jeton,
          horodatage_date: d.horodatage_date,
          horodatage_statut: d.horodatage_statut,
          horodatage_prestataire: d.horodatage_prestataire,
          horodatage_algorithme: d.horodatage_algorithme,
        },
        image
      );
    } catch {
      alert("La génération du rapport a échoué.");
    } finally {
      setGenEnCours(null);
    }
  }

  useEffect(() => {
    async function charger() {
      // Cloisonnement strict en base sur procedure_id. Sans procédure active,
      // rien à afficher.
      const procId = await getProcedureActiveId();
      const dataEnfants = await getEnfantsDeProcedureActive();
      setEnfants(dataEnfants);

      if (!procId) {
        setPreuves([]);
        setChargement(false);
        return;
      }

      // Colonnes d'affichage + CSV uniquement. Les champs lourds réservés au
      // rapport PDF (empreinte serveur, jeton, métadonnées...) sont rechargés à la
      // demande dans genererRapport, pour alléger la liste.
      const resPreuves = await supabase
        .from("preuves_photo")
        .select(
          "id, created_at, titre, description, enfant_id, nom_fichier, type_fichier, taille_octets, empreinte_sha256, horodatage_date, horodatage_statut, storage_path, gps_latitude, gps_longitude, gps_precision_metres, ecart_heure_secondes"
        )
        .eq("procedure_id", procId)
        .order("created_at", { ascending: false });
      if (resPreuves.data) setPreuves(resPreuves.data as Preuve[]);
      setChargement(false);
    }
    charger();
  }, []);

  function nomEnfant(id: string | null): string {
    if (!id) return "Sans enfant associé";
    const e = enfants.find((x) => x.id === id);
    return e?.prenom_ou_alias || "Enfant";
  }

  // Ouvrir le fichier original (bucket privé) via une URL signée temporaire
  async function voirOriginal(chemin: string | null) {
    if (!chemin) return;
    const { data, error } = await supabase.storage
      .from("preuves")
      .createSignedUrl(chemin, 60); // valide 60 secondes
    if (error || !data) {
      alert("Impossible d'ouvrir le fichier.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  function formaterTaille(octets: number | null): string {
    if (!octets) return "-";
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  }

  // Cloisonnement assuré en base (procedure_id) lors du chargement.
  const preuvesProcedure = preuves;

  // Export CSV : bordereau léger des preuves de la procédure active.
  // Champs non sensibles uniquement (pas de GPS, pas de chemin de stockage).
  function exporterPreuvePhotoCsv() {
    const libelleHorodatage = (statut: string | null): string => {
      if (statut === "non_qualifie") return "horodaté (non qualifié)";
      if (statut === "qualifie") return "horodaté (qualifié)";
      if (statut === "a_refaire") return "à refaire";
      return "-";
    };

    const enTete = [
      "Date",
      "Titre",
      "Enfant",
      "Fichier",
      "Type",
      "Taille",
      "Horodatage",
      "Date horodatage",
      "Empreinte SHA-256",
    ];

    const lignes = preuvesProcedure.map((p) => [
      dateHeureFr(p.created_at),
      p.titre ?? "",
      nomEnfant(p.enfant_id),
      p.nom_fichier ?? "",
      p.type_fichier ?? "",
      formaterTaille(p.taille_octets),
      libelleHorodatage(p.horodatage_statut),
      p.horodatage_date ? dateHeureFr(p.horodatage_date) : "-",
      p.empreinte_sha256 ?? "",
    ]);

    const csv = construireCsv({
      enTete,
      lignes,
      contexte: { titre: "Preuves photo (procédure active)" },
    });
    const nomFichier = `preuves-parent-preuve-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  // Regrouper les preuves (filtrées) par enfant
  const groupes = new Map<string, Preuve[]>();
  for (const p of preuvesProcedure) {
    const cle = p.enfant_id ?? "aucun";
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push(p);
  }

  return (
    <AppShell
      titre="Preuves photo"
      description="Consulter les preuves importees, verifier leurs informations et preparer un rapport si necessaire."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/organiser" variant="secondary">
            Retour Organiser
          </AppButtonLink>
          <AppButtonLink href="/collecter/rapide">
            Collecter une preuve
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-[var(--app-text-muted)]">
          Une preuve photo, c&apos;est une image accompagnée de ses informations
          techniques (empreinte, horodatage), pour mieux l&apos;organiser dans votre
          dossier. Pour ranger une facture ou un document déjà reçu, utilisez plutôt{" "}
          <a href="/documents" className="font-medium text-[var(--app-primary)] underline">
            Documents et justificatifs
          </a>
          .
        </p>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={exporterPreuvePhotoCsv}
            disabled={preuvesProcedure.length === 0}
            className="rounded-md border border-[var(--app-border)] px-4 py-2 text-sm font-medium text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:opacity-50"
          >
            Exporter en CSV
          </button>
          <AppButtonLink href="/preuves/nouvelle">
            + Nouvelle preuve
          </AppButtonLink>
        </div>

        {chargement && (
          <p className="text-sm text-[var(--app-text-muted)]">Chargement...</p>
        )}

        {!chargement && preuvesProcedure.length === 0 && (
          <AppCard>
            <div className="text-center space-y-3">
              <p className="text-[var(--app-text-muted)]">
                Aucune preuve pour cette procédure.
              </p>
              <AppButtonLink href="/preuves/nouvelle">
                Créer ma première preuve
              </AppButtonLink>
            </div>
          </AppCard>
        )}

        {!chargement &&
          Array.from(groupes.entries()).map(([cle, liste]) => (
            <section key={cle} className="space-y-3">
              <h2 className="font-semibold text-xl text-[var(--app-text)] border-b border-[var(--app-border)] pb-1">
                {nomEnfant(cle === "aucun" ? null : cle)}
              </h2>

              {liste.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[var(--app-text)]">
                        {p.titre || "Preuve sans titre"}
                      </p>
                      <p className="text-xs text-[var(--app-text-muted)]">
                        Scellée le {dateHeureFr(p.created_at)}
                      </p>
                      {pastilleHorodatage(p.horodatage_statut) && (
                        <span
                          className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            pastilleHorodatage(p.horodatage_statut)!.classes
                          }`}
                        >
                          {pastilleHorodatage(p.horodatage_statut)!.label}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => genererRapport(p)}
                        disabled={genEnCours === p.id}
                        className="rounded-md bg-[var(--app-primary)] px-3 py-1.5 text-xs font-medium text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)] disabled:opacity-50"
                      >
                        {genEnCours === p.id ? "Génération..." : "Rapport PDF"}
                      </button>
                      {p.storage_path && (
                        <button
                          onClick={() => voirOriginal(p.storage_path)}
                          className="rounded-md border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
                        >
                          Voir l&apos;original
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {p.horodatage_statut === "a_refaire" && p.empreinte_sha256 && (
                      <button
                        onClick={() => relancerHorodatage(p)}
                        disabled={actionEnCours === `${p.id}:horodatage`}
                        className="rounded-md border border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                      >
                        {actionEnCours === `${p.id}:horodatage`
                          ? "Horodatage..."
                          : "Relancer l'horodatage"}
                      </button>
                    )}
                    {p.storage_path && p.empreinte_sha256 && (
                      <button
                        onClick={() => relancerVerificationHash(p)}
                        disabled={actionEnCours === `${p.id}:hash`}
                        className="rounded-md border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:opacity-50"
                      >
                        {actionEnCours === `${p.id}:hash`
                          ? "Vérification..."
                          : "Vérifier l'intégrité"}
                      </button>
                    )}
                  </div>

                  {retour[p.id] && (
                    <p className="text-xs text-[var(--app-text-muted)]">{retour[p.id]}</p>
                  )}

                  {p.description && (
                    <p className="text-sm text-[var(--app-text-muted)] whitespace-pre-wrap">
                      {p.description}
                    </p>
                  )}

                  <OptionsAvancees titre="Détails techniques">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <dt className="text-[var(--app-text-muted)]">Fichier</dt>
                      <dd className="text-[var(--app-text)] break-all">
                        {p.nom_fichier || "-"} ({formaterTaille(p.taille_octets)})
                      </dd>

                      <dt className="text-[var(--app-text-muted)]">Position</dt>
                      <dd className="text-[var(--app-text)]">
                        {p.gps_latitude != null && p.gps_longitude != null
                          ? `${p.gps_latitude.toFixed(5)}, ${p.gps_longitude.toFixed(
                              5
                            )} (±${Math.round(p.gps_precision_metres ?? 0)} m)`
                          : "non disponible"}
                      </dd>

                      <dt className="text-[var(--app-text-muted)]">Écart d&apos;heure</dt>
                      <dd className="text-[var(--app-text)]">
                        {p.ecart_heure_secondes != null
                          ? `${p.ecart_heure_secondes} s`
                          : "-"}
                      </dd>
                    </dl>

                    {p.empreinte_sha256 && (
                      <div>
                        <p className="text-xs text-[var(--app-text-muted)] mb-1">
                          Empreinte SHA-256
                        </p>
                        <p className="rounded-md bg-[var(--app-surface-muted)] px-3 py-2 font-mono text-[10px] text-[var(--app-text)] break-all border border-[var(--app-border)]">
                          {p.empreinte_sha256}
                        </p>
                      </div>
                    )}
                  </OptionsAvancees>
                </div>
              ))}
            </section>
          ))}

        <AppNotice titre="Document de travail">
          <p>
            Ces preuves numériques renforcées sont scellées et horodatées. Elles ne
            constituent pas un constat de commissaire de justice. Relisez les
            informations avant tout usage. Le rapport PDF reste un document de travail.
          </p>
        </AppNotice>
      </div>
    </AppShell>
  );
}
