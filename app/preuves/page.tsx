"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";
import { Icon } from "@/components/apercu/icones";
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

type TonBadge = "info" | "attention" | "neutre";

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

// Badge d'horodatage en vocabulaire PRUDENT (information technique, sans
// préjuger de la valeur juridique).
function badgeHorodatage(
  statut: string | null
): { label: string; ton: TonBadge } {
  if (statut === "non_qualifie") return { label: "Horodatage enregistré", ton: "info" };
  if (statut === "qualifie") return { label: "Horodatage enregistré (qualifié)", ton: "info" };
  if (statut === "a_refaire") return { label: "Horodatage à vérifier", ton: "attention" };
  return { label: "Horodatage non enregistré", ton: "neutre" };
}

// Petit badge thémé (tokens --app-*). Tons prudents, pas de vocabulaire
// juridique fort.
function BadgeTech({ children, ton }: { children: React.ReactNode; ton: TonBadge }) {
  const style =
    ton === "info"
      ? { backgroundColor: "var(--app-info-soft)", color: "var(--app-info)", borderColor: "var(--app-info-border)" }
      : ton === "attention"
        ? { backgroundColor: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" }
        : { backgroundColor: "var(--app-surface-muted)", color: "var(--app-text-muted)", borderColor: "var(--app-border)" };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={style}
    >
      {children}
    </span>
  );
}

const FILTRES = ["Toutes", "Avec empreinte", "Horodatées", "À vérifier"];

export default function PreuvesPage() {
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [chargement, setChargement] = useState(true);

  const [genEnCours, setGenEnCours] = useState<string | null>(null);

  // Action technique en cours (clé "id:horodatage" ou "id:hash") + retour par preuve.
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [retour, setRetour] = useState<Record<string, string>>({});

  // Recherche + filtre locaux (sur les preuves déjà chargées, aucune requête).
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("Toutes");

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
      // rapport PDF (empreinte serveur, jeton, métadonnées…) sont rechargés à la
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
    if (!octets) return "—";
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
      return "—";
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
      p.horodatage_date ? dateHeureFr(p.horodatage_date) : "—",
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

  // Recherche + filtre (locaux, sur les preuves déjà chargées).
  const terme = recherche.trim().toLowerCase();
  const preuvesFiltrees = preuvesProcedure.filter((p) => {
    const texte = `${p.titre ?? ""} ${p.description ?? ""}`.toLowerCase();
    const okRecherche = terme === "" || texte.includes(terme);
    const okFiltre =
      filtre === "Toutes" ||
      (filtre === "Avec empreinte" && !!p.empreinte_sha256) ||
      (filtre === "Horodatées" &&
        (p.horodatage_statut === "non_qualifie" || p.horodatage_statut === "qualifie")) ||
      (filtre === "À vérifier" && p.horodatage_statut === "a_refaire");
    return okRecherche && okFiltre;
  });

  // Regrouper les preuves (filtrées) par enfant
  const groupes = new Map<string, Preuve[]>();
  for (const p of preuvesFiltrees) {
    const cle = p.enfant_id ?? "aucun";
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push(p);
  }

  const btnSecondaire =
    "rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50";

  return (
    <AppShell
      activeModule="preuves"
      title="Preuves"
      subtitle="Photos et pièces avec informations techniques (empreinte, horodatage)."
      copilotContext="preuves"
      actions={
        <>
          <button
            type="button"
            onClick={exporterPreuvePhotoCsv}
            disabled={preuvesProcedure.length === 0}
            className="hidden items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
            style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface)", color: "var(--app-text-muted)" }}
          >
            <Icon name="syntheses" className="h-4 w-4" />
            Exporter
          </button>
          <Link
            href="/preuves/nouvelle"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition md:inline-flex"
            style={{ backgroundColor: "var(--app-primary)" }}
          >
            <Icon name="plus" className="h-4 w-4" />
            Ajouter une preuve
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {/* Encart prudent sur la portée juridique */}
        <div
          className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs"
          style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        >
          <span style={{ color: "var(--app-text-muted)" }}>
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0" />
          </span>
          <p>
            Les informations techniques, comme l&apos;empreinte et l&apos;horodatage,
            facilitent la traçabilité d&apos;un fichier. Elles ne préjugent pas de sa
            valeur juridique, qui s&apos;apprécie au cas par cas. Pour ranger une
            facture ou un document déjà reçu, utilisez plutôt{" "}
            <Link href="/documents" className="underline" style={{ color: "var(--app-primary)" }}>
              Documents et justificatifs
            </Link>
            .
          </p>
        </div>

        {/* Recherche + filtres */}
        <div className="rounded-lg border p-3" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--app-text-muted)" }}>
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher une preuve"
              className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
              style={{ borderColor: "var(--app-border)", backgroundColor: "var(--app-surface-muted)", color: "var(--app-text)" }}
            />
          </div>
          <div className="mt-2 flex min-w-0 flex-nowrap gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
            {FILTRES.map((option) => {
              const selectionne = option === filtre;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFiltre(option)}
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
          <div className="mt-3 sm:hidden">
            <Link
              href="/preuves/nouvelle"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--app-primary)" }}
            >
              <Icon name="plus" className="h-4 w-4" />
              Ajouter une preuve
            </Link>
          </div>
        </div>

        {chargement && (
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>Chargement…</p>
        )}

        {/* État vide intelligent */}
        {!chargement && preuvesProcedure.length === 0 && (
          <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
            <p style={{ color: "var(--app-text-muted)" }}>
              Aucune preuve ajoutée pour cette procédure. Ajoutez une photo, une
              capture ou un document pour renforcer la traçabilité de votre dossier.
            </p>
            <Link
              href="/preuves/nouvelle"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--app-primary)" }}
            >
              <Icon name="plus" className="h-4 w-4" />
              Ajouter une preuve
            </Link>
          </div>
        )}

        {!chargement && preuvesProcedure.length > 0 && groupes.size === 0 && (
          <div className="rounded-xl border p-6 text-center text-sm" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>
            Aucune preuve pour ce filtre.
          </div>
        )}

        {!chargement &&
          Array.from(groupes.entries()).map(([cle, liste]) => (
            <section key={cle} className="space-y-3">
              <h2 className="border-b pb-1 text-base font-semibold" style={{ color: "var(--app-text)", borderColor: "var(--app-border)" }}>
                {nomEnfant(cle === "aucun" ? null : cle)}
              </h2>

              {liste.map((p) => {
                const hb = badgeHorodatage(p.horodatage_statut);
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border p-5 space-y-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                    style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium" style={{ color: "var(--app-text)" }}>
                          {p.titre || "Preuve sans titre"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                          Scellée le {dateHeureFr(p.created_at)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <BadgeTech ton={p.empreinte_sha256 ? "info" : "neutre"}>
                            {p.empreinte_sha256 ? "Empreinte technique présente" : "Empreinte technique absente"}
                          </BadgeTech>
                          <BadgeTech ton={hb.ton}>{hb.label}</BadgeTech>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => genererRapport(p)}
                          disabled={genEnCours === p.id}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
                          style={{ backgroundColor: "var(--app-primary)" }}
                        >
                          {genEnCours === p.id ? "Génération…" : "Rapport PDF"}
                        </button>
                        {p.storage_path && (
                          <button
                            onClick={() => voirOriginal(p.storage_path)}
                            className={btnSecondaire}
                            style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
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
                          className={btnSecondaire}
                          style={{ borderColor: "#FED7AA", color: "#C2410C" }}
                        >
                          {actionEnCours === `${p.id}:horodatage`
                            ? "Horodatage…"
                            : "Relancer l'horodatage"}
                        </button>
                      )}
                      {p.storage_path && p.empreinte_sha256 && (
                        <button
                          onClick={() => relancerVerificationHash(p)}
                          disabled={actionEnCours === `${p.id}:hash`}
                          className={btnSecondaire}
                          style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
                        >
                          {actionEnCours === `${p.id}:hash`
                            ? "Vérification…"
                            : "Vérifier l'intégrité"}
                        </button>
                      )}
                    </div>

                    {retour[p.id] && (
                      <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{retour[p.id]}</p>
                    )}

                    {p.description && (
                      <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--app-text)" }}>
                        {p.description}
                      </p>
                    )}

                    <OptionsAvancees titre="Détails techniques">
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <dt style={{ color: "var(--app-text-muted)" }}>Fichier</dt>
                        <dd className="break-all" style={{ color: "var(--app-text)" }}>
                          {p.nom_fichier || "—"} ({formaterTaille(p.taille_octets)})
                        </dd>

                        <dt style={{ color: "var(--app-text-muted)" }}>Position</dt>
                        <dd style={{ color: "var(--app-text)" }}>
                          {p.gps_latitude != null && p.gps_longitude != null
                            ? `${p.gps_latitude.toFixed(5)}, ${p.gps_longitude.toFixed(
                                5
                              )} (±${Math.round(p.gps_precision_metres ?? 0)} m)`
                            : "non disponible"}
                        </dd>

                        <dt style={{ color: "var(--app-text-muted)" }}>Écart d&apos;heure</dt>
                        <dd style={{ color: "var(--app-text)" }}>
                          {p.ecart_heure_secondes != null
                            ? `${p.ecart_heure_secondes} s`
                            : "—"}
                        </dd>
                      </dl>

                      {p.empreinte_sha256 && (
                        <div>
                          <p className="mb-1 text-xs" style={{ color: "var(--app-text-muted)" }}>
                            Empreinte SHA-256
                          </p>
                          <p
                            className="rounded-md border px-3 py-2 font-mono text-[10px] break-all"
                            style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
                          >
                            {p.empreinte_sha256}
                          </p>
                        </div>
                      )}
                    </OptionsAvancees>
                  </div>
                );
              })}
            </section>
          ))}

        <p className="text-xs leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
          Ces preuves numériques renforcées sont scellées et horodatées. Elles ne
          constituent pas un constat de commissaire de justice.
        </p>
      </div>
    </AppShell>
  );
}
