"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";

type Piece = {
  id: string;
  nature: "document" | "preuve";
  libelle: string;
  categorie: string;
  date: string | null;
  enfantId: string | null;
  bucket: "justificatifs" | "preuves";
  chemin: string | null;
};

type Enfant = { id: string; prenom_ou_alias: string | null };

function dateFr(valeur: string | null): string {
  if (!valeur) return "Sans date";
  const d = new Date(valeur);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CoffreFortPage() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState("");

  const [filtreNature, setFiltreNature] = useState<"toutes" | "document" | "preuve">("toutes");
  const [filtreCategorie, setFiltreCategorie] = useState("toutes");
  const [filtreEnfant, setFiltreEnfant] = useState("tous");
  const [recherche, setRecherche] = useState("");

  async function charger() {
    setChargement(true);
    setMessage("");

    const [dataEnfants, resDocs, resPreuves] = await Promise.all([
      getEnfantsDeProcedureActive(),
      supabase
        .from("documents")
        .select("id, libelle, categorie, chemin_fichier, date_document, child_id")
        .order("created_at", { ascending: false }),
      supabase
        .from("preuves_photo")
        .select("id, titre, enfant_id, storage_path, created_at")
        .order("created_at", { ascending: false }),
    ]);

    setEnfants(dataEnfants);

    // Pièces de la procédure active : enfant de la procédure OU sans enfant (générales).
    const idsProc = new Set(dataEnfants.map((e) => e.id));

    const liste: Piece[] = [];

    if (resDocs.error) setMessage("Erreur de chargement des documents : " + resDocs.error.message);
    for (const d of resDocs.data ?? []) {
      if (d.child_id !== null && !idsProc.has(d.child_id)) continue;
      liste.push({
        id: d.id,
        nature: "document",
        libelle: d.libelle ?? "Sans libellé",
        categorie: d.categorie ?? "Autre",
        date: d.date_document,
        enfantId: d.child_id,
        bucket: "justificatifs",
        chemin: d.chemin_fichier,
      });
    }

    if (resPreuves.error) setMessage("Erreur de chargement des preuves : " + resPreuves.error.message);
    for (const p of resPreuves.data ?? []) {
      if (p.enfant_id !== null && !idsProc.has(p.enfant_id)) continue;
      liste.push({
        id: p.id,
        nature: "preuve",
        libelle: p.titre ?? "Preuve scellée",
        categorie: "Preuve scellée et horodatée",
        date: p.created_at,
        enfantId: p.enfant_id,
        bucket: "preuves",
        chemin: p.storage_path,
      });
    }

    setPieces(liste);
    setChargement(false);
  }

  useEffect(() => {
    charger();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(pieces.map((p) => p.categorie));
    return Array.from(set).sort();
  }, [pieces]);

  const piecesFiltrees = useMemo(() => {
    const motcle = recherche.trim().toLowerCase();
    return pieces.filter((p) => {
      if (filtreNature !== "toutes" && p.nature !== filtreNature) return false;
      if (filtreCategorie !== "toutes" && p.categorie !== filtreCategorie) return false;
      if (filtreEnfant !== "tous" && p.enfantId !== filtreEnfant) return false;
      if (motcle && !p.libelle.toLowerCase().includes(motcle)) return false;
      return true;
    });
  }, [pieces, filtreNature, filtreCategorie, filtreEnfant, recherche]);

  // Classement : par enfant, puis par type, puis par date décroissante.
  const groupes = useMemo(() => {
    const parEnfant = new Map<string | null, Piece[]>();
    for (const p of piecesFiltrees) {
      const cle = p.enfantId ?? null;
      if (!parEnfant.has(cle)) parEnfant.set(cle, []);
      parEnfant.get(cle)!.push(p);
    }
    const ordre: (string | null)[] = [];
    for (const e of enfants) if (parEnfant.has(e.id)) ordre.push(e.id);
    if (parEnfant.has(null)) ordre.push(null);

    return ordre.map((cle) => {
      const items = parEnfant.get(cle)!;
      const parType = new Map<string, Piece[]>();
      for (const it of items) {
        if (!parType.has(it.categorie)) parType.set(it.categorie, []);
        parType.get(it.categorie)!.push(it);
      }
      const types = Array.from(parType.entries())
        .map(([type, pcs]) => ({
          type,
          estPreuve: pcs[0].nature === "preuve",
          pieces: pcs.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
        }))
        .sort((a, b) => a.type.localeCompare(b.type, "fr"));
      return { enfantId: cle, types };
    });
  }, [piecesFiltrees, enfants]);

  function nomEnfant(id: string | null): string | null {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  async function ouvrir(piece: Piece) {
    if (!piece.chemin) {
      setMessage("Cette pièce n'a pas de fichier associé.");
      return;
    }
    const { data, error } = await supabase.storage
      .from(piece.bucket)
      .createSignedUrl(piece.chemin, 60);
    if (error || !data) setMessage("Impossible d'ouvrir le fichier.");
    else window.open(data.signedUrl, "_blank");
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Pièces"
        title="Coffre-fort"
        subtitle="Toutes vos pièces au même endroit : justificatifs et preuves scellées. Vue de consultation."
      />

      <div className="mx-auto max-w-3xl px-6 pt-10 pb-12">
        {/* Barre de filtres */}
        <div className="carte rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Recherche</label>
              <input
                type="text"
                placeholder="Rechercher par libellé…"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nature</label>
              <select
                value={filtreNature}
                onChange={(e) => setFiltreNature(e.target.value as typeof filtreNature)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="toutes">Toutes</option>
                <option value="document">Justificatifs</option>
                <option value="preuve">Preuves photo horodatées</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Catégorie</label>
              <select
                value={filtreCategorie}
                onChange={(e) => setFiltreCategorie(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="toutes">Toutes</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Enfant concerné</label>
              <select
                value={filtreEnfant}
                onChange={(e) => setFiltreEnfant(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="tous">Tous</option>
                {enfants.map((e) => (
                  <option key={e.id} value={e.id}>{e.prenom_ou_alias ?? "—"}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {chargement
            ? "Chargement…"
            : `${piecesFiltrees.length} pièce(s) affichée(s) sur ${pieces.length} au total.`}
        </p>

        {message && <p className="mt-2 text-sm text-[#9B2C2C]">{message}</p>}

        {/* Liste classée par enfant, puis par type, puis par date décroissante */}
        <div className="mt-4 space-y-8">
          {!chargement && piecesFiltrees.length === 0 && (
            <p className="text-slate-500">Aucune pièce ne correspond à ces filtres.</p>
          )}

          {groupes.map((groupe) => (
            <div key={groupe.enfantId ?? "sans-enfant"} className="space-y-4">
              <h2 className="border-b border-slate-300 pb-1 text-base font-semibold text-[#15233F]">
                {nomEnfant(groupe.enfantId) ?? "Pièces sans enfant rattaché"}
              </h2>

              {groupe.types.map((t) => (
                <div key={t.type} className="space-y-2">
                  <p
                    className={
                      "text-xs font-medium uppercase tracking-wide " +
                      (t.estPreuve ? "text-[#2E6A4D]" : "text-slate-500")
                    }
                  >
                    {t.type}
                  </p>

                  {t.pieces.map((piece) => (
                    <div
                      key={`${piece.nature}-${piece.id}`}
                      className="carte rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#15233F]">{piece.libelle}</p>
                          <p className="text-sm text-slate-500">{dateFr(piece.date)}</p>
                        </div>
                        <button
                          onClick={() => ouvrir(piece)}
                          className="shrink-0 text-sm text-slate-700 hover:underline"
                        >
                          Ouvrir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-500">
          Les justificatifs sont des pièces que vous avez déposées. Les preuves scellées sont des
          preuves numériques renforcées (horodatées et scellées). Cette présentation organise vos
          pièces ; leur portée reste soumise à l'appréciation du juge.
        </p>
      </div>
    </main>
  );
}
