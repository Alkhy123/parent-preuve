"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import { getEnfantsDeProcedureActive } from "@/lib/procedureActive";
import { construireCsv } from "@/lib/csvExport";
import { telechargerCsv } from "@/lib/telechargerCsv";
import {
  CATEGORIES_IMPLICATION,
  libelleImplication,
} from "@/lib/implicationParentale";

type Enfant = { id: string; prenom_ou_alias: string };

type FaitMarque = {
  id: string;
  titre: string;
  date_evenement: string | null;
  child_id: string | null;
  implication_categorie: string | null;
};

type PieceMarquee = {
  id: string;
  libelle: string;
  date_document: string | null;
  child_id: string | null;
  implication_categorie: string | null;
};

// Élément unifié (fait OU pièce) pour l'affichage et l'export.
type Element = {
  nature: "Fait" | "Pièce";
  date: string;
  intitule: string;
  enfant: string | null;
  categorie: string; // valeur brute : sante | scolarite | activites | quotidien
};

export default function ImplicationParentalePage() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [faits, setFaits] = useState<FaitMarque[]>([]);
  const [pieces, setPieces] = useState<PieceMarquee[]>([]);
  const [message, setMessage] = useState("");

  async function chargerEnfants() {
    const data = await getEnfantsDeProcedureActive();
    setEnfants(data);
  }

  async function chargerFaits() {
    // Faits du journal marqués comme implication parentale (catégorie non nulle).
    const { data, error } = await supabase
      .from("events")
      .select("id, titre, date_evenement, child_id, implication_categorie")
      .not("implication_categorie", "is", null)
      .order("date_evenement", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setFaits(data ?? []);
  }

  async function chargerPieces() {
    // Pièces marquées comme implication parentale (catégorie non nulle).
    const { data, error } = await supabase
      .from("documents")
      .select("id, libelle, date_document, child_id, implication_categorie")
      .not("implication_categorie", "is", null)
      .order("date_document", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setPieces(data ?? []);
  }

  useEffect(() => {
    chargerEnfants();
    chargerFaits();
    chargerPieces();
  }, []);

  function nomEnfant(id: string | null) {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  // Cloisonnement procédure active : on garde les lignes d'un enfant de la
  // procédure active OU sans enfant rattaché (générales). On fusionne ensuite
  // faits + pièces en une seule liste d'éléments.
  const elements = useMemo<Element[]>(() => {
    const idsProc = new Set(enfants.map((e) => e.id));
    const garde = (childId: string | null) =>
      childId === null || idsProc.has(childId);

    const elFaits: Element[] = faits
      .filter((f) => garde(f.child_id))
      .map((f) => ({
        nature: "Fait",
        date: f.date_evenement ?? "",
        intitule: f.titre,
        enfant: nomEnfant(f.child_id),
        categorie: f.implication_categorie ?? "",
      }));

    const elPieces: Element[] = pieces
      .filter((p) => garde(p.child_id))
      .map((p) => ({
        nature: "Pièce",
        date: p.date_document ?? "",
        intitule: p.libelle,
        enfant: nomEnfant(p.child_id),
        categorie: p.implication_categorie ?? "",
      }));

    return [...elFaits, ...elPieces];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faits, pieces, enfants]);

  // Regroupement par catégorie d'implication, dans l'ordre des catégories,
  // chaque groupe trié par date décroissante.
  const groupes = useMemo(() => {
    return CATEGORIES_IMPLICATION.map((cat) => {
      const items = elements
        .filter((el) => el.categorie === cat.valeur)
        .sort((a, b) => b.date.localeCompare(a.date));
      return { categorie: cat, items };
    }).filter((g) => g.items.length > 0);
  }, [elements]);

  const total = elements.length;

  // Export CSV : on aplatit les groupes pour garder l'ordre par catégorie puis
  // par date. On n'exporte que des faits documentés par l'utilisateur, sans
  // aucune qualification. L'avertissement non qualifié est ajouté par construireCsv().
  function exporterCsv() {
    const enTete = ["Nature", "Catégorie d'implication", "Date", "Intitulé", "Enfant"];
    const lignes = groupes.flatMap((g) =>
      g.items.map((el) => [
        el.nature,
        libelleImplication(el.categorie) ?? "",
        el.date,
        el.intitule,
        el.enfant ?? "",
      ])
    );
    const csv = construireCsv({
      enTete,
      lignes,
      contexte: { titre: "Implication parentale — éléments documentés" },
    });
    const nomFichier = `implication-parentale-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Synthèses & exports"
        title="Implication parentale"
        subtitle="Les faits et pièces que vous avez marqués comme éléments d'implication parentale, classés par thème."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">

        {/* Rappel de neutralité */}
        <div className="rounded-lg border border-[#C2A24C]/40 bg-[#C2A24C]/10 px-4 py-3 text-sm text-[#1F2733]">
          Cette page rassemble uniquement des éléments factuels que vous avez
          vous-même documentés et marqués. Elle ne qualifie pas votre implication&nbsp;:
          ces éléments sont soumis à l&apos;appréciation du juge. À faire relire par
          un professionnel du droit si nécessaire.
        </div>

        {/* Export CSV */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-slate-600">
            {total} élément{total > 1 ? "s" : ""} marqué{total > 1 ? "s" : ""}.
          </span>
          <button
            onClick={exporterCsv}
            disabled={total === 0}
            className="ml-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-[#15233F] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exporter en CSV
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-[#9B2C2C]">{message}</p>}

        {/* Sections par catégorie */}
        <div className="mt-8 space-y-8">
          {total === 0 && (
            <p className="text-slate-500">
              Aucun élément marqué pour cette procédure. Marquez un fait dans le
              journal ou une pièce dans les documents avec une catégorie
              d&apos;implication pour le voir apparaître ici.
            </p>
          )}

          {groupes.map((groupe) => (
            <div key={groupe.categorie.valeur} className="space-y-3">
              <h2 className="border-b border-slate-300 pb-1 text-base font-semibold text-[#15233F]">
                {groupe.categorie.libelle}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({groupe.items.length})
                </span>
              </h2>

              {groupe.items.map((el, i) => (
                <div
                  key={`${el.nature}-${i}`}
                  className="carte rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                      {el.nature}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-[#15233F]">{el.intitule}</p>
                  <p className="text-sm text-slate-500">
                    {el.date || "Sans date"}
                    {el.enfant ? ` · ${el.enfant}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}