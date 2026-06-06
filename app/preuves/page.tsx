"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { exporterPreuvePdf } from "@/lib/preuvePdf";

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

  async function genererRapport(p: Preuve) {
    setGenEnCours(p.id);
    try {
      let image: { dataUrl: string; w: number; h: number } | null = null;
      if (p.storage_path) {
        const { data } = await supabase.storage
          .from("preuves")
          .download(p.storage_path);
        if (data) image = await blobVersImage(data);
      }
      exporterPreuvePdf(
        {
          titre: p.titre,
          description: p.description,
          nom_enfant: nomEnfant(p.enfant_id),
          created_at: p.created_at,
          nom_fichier: p.nom_fichier,
          type_fichier: p.type_fichier,
          taille_octets: p.taille_octets,
          empreinte_sha256: p.empreinte_sha256,
          heure_appareil: p.heure_appareil,
          ecart_heure_secondes: p.ecart_heure_secondes,
          gps_latitude: p.gps_latitude,
          gps_longitude: p.gps_longitude,
          gps_precision_metres: p.gps_precision_metres,
          horodatage_jeton: p.horodatage_jeton,
          horodatage_date: p.horodatage_date,
          horodatage_statut: p.horodatage_statut,
          horodatage_prestataire: p.horodatage_prestataire,
          horodatage_algorithme: p.horodatage_algorithme,
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
      const [resPreuves, resEnfants] = await Promise.all([
        supabase
          .from("preuves_photo")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("children").select("id, prenom_ou_alias"),
      ]);
      if (resPreuves.data) setPreuves(resPreuves.data as Preuve[]);
      if (resEnfants.data) setEnfants(resEnfants.data as Enfant[]);
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

  // Regrouper les preuves par enfant
  const groupes = new Map<string, Preuve[]>();
  for (const p of preuves) {
    const cle = p.enfant_id ?? "aucun";
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push(p);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC]">
      <PageHeader
        eyebrow="Preuve photo"
        title="Mes preuves"
        subtitle="Vos preuves scellées, regroupées par enfant."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <div className="flex justify-end">
          <Link
            href="/preuves/nouvelle"
            className="rounded-md bg-[#15233F] px-4 py-2 text-sm font-medium text-white hover:bg-[#15233F]/90"
          >
            + Nouvelle preuve
          </Link>
        </div>

        {chargement && (
          <p className="text-sm text-[#1F2733]/70">Chargement…</p>
        )}

        {!chargement && preuves.length === 0 && (
          <div className="carte rounded-lg border border-[#C2A24C]/40 bg-white p-8 text-center">
            <p className="text-[#1F2733]/70">
              Aucune preuve pour le moment.
            </p>
            <Link
              href="/preuves/nouvelle"
              className="mt-3 inline-block text-sm font-medium text-[#15233F] underline"
            >
              Créer ma première preuve
            </Link>
          </div>
        )}

        {!chargement &&
          Array.from(groupes.entries()).map(([cle, liste]) => (
            <section key={cle} className="space-y-3">
              <h2 className="font-display text-xl text-[#15233F] border-b border-[#C2A24C]/40 pb-1">
                {nomEnfant(cle === "aucun" ? null : cle)}
              </h2>

              {liste.map((p) => (
                <div
                  key={p.id}
                  className="carte rounded-lg border border-[#C2A24C]/40 bg-white p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#1F2733]">
                        {p.titre || "Preuve sans titre"}
                      </p>
                      <p className="text-xs text-[#1F2733]/60">
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
                        className="rounded-md bg-[#15233F] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#15233F]/90 disabled:opacity-50"
                      >
                        {genEnCours === p.id ? "Génération…" : "Rapport PDF"}
                      </button>
                      {p.storage_path && (
                        <button
                          onClick={() => voirOriginal(p.storage_path)}
                          className="rounded-md border border-[#15233F]/30 px-3 py-1.5 text-xs font-medium text-[#15233F] hover:bg-[#15233F]/5"
                        >
                          Voir l'original
                        </button>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-sm text-[#1F2733]/80 whitespace-pre-wrap">
                      {p.description}
                    </p>
                  )}

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <dt className="text-[#1F2733]/60">Fichier</dt>
                    <dd className="text-[#1F2733] break-all">
                      {p.nom_fichier || "—"} ({formaterTaille(p.taille_octets)})
                    </dd>

                    <dt className="text-[#1F2733]/60">Position</dt>
                    <dd className="text-[#1F2733]">
                      {p.gps_latitude != null && p.gps_longitude != null
                        ? `${p.gps_latitude.toFixed(5)}, ${p.gps_longitude.toFixed(
                            5
                          )} (±${Math.round(p.gps_precision_metres ?? 0)} m)`
                        : "non disponible"}
                    </dd>

                    <dt className="text-[#1F2733]/60">Écart d'heure</dt>
                    <dd className="text-[#1F2733]">
                      {p.ecart_heure_secondes != null
                        ? `${p.ecart_heure_secondes} s`
                        : "—"}
                    </dd>
                  </dl>

                  {p.empreinte_sha256 && (
                    <div>
                      <p className="text-xs text-[#1F2733]/60 mb-1">
                        Empreinte SHA-256
                      </p>
                      <p className="rounded-md bg-[#F8F6F1] px-3 py-2 font-mono text-[10px] text-[#15233F] break-all border border-[#C2A24C]/30">
                        {p.empreinte_sha256}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}

        <p className="text-xs leading-relaxed text-[#1F2733]/60">
          Ces preuves numériques renforcées sont scellées et horodatées. Elles ne
          constituent pas un constat de commissaire de justice.
        </p>
      </div>
    </main>
  );
}