"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import { getEnfantsDeProcedureActive, getProcedureActiveId } from "@/lib/procedureActive";
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

// Element unifie (fait OU piece) pour l'affichage et l'export.
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
    // Faits du journal marques comme implication parentale, cloisonnes en base.
    const procId = await getProcedureActiveId();
    if (!procId) {
      setFaits([]);
      return;
    }
    const { data, error } = await supabase
      .from("events")
      .select("id, titre, date_evenement, child_id, implication_categorie")
      .eq("procedure_id", procId)
      .not("implication_categorie", "is", null)
      .order("date_evenement", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setFaits(data ?? []);
  }

  async function chargerPieces() {
    // Pieces marquees comme implication parentale, cloisonnees en base.
    const procId = await getProcedureActiveId();
    if (!procId) {
      setPieces([]);
      return;
    }
    const { data, error } = await supabase
      .from("documents")
      .select("id, libelle, date_document, child_id, implication_categorie")
      .eq("procedure_id", procId)
      .not("implication_categorie", "is", null)
      .order("date_document", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setPieces(data ?? []);
  }

  useEffect(() => {
    // Chargements async (setState après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerEnfants();
    chargerFaits();
    chargerPieces();
  }, []);

  function nomEnfant(id: string | null) {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  // Cloisonnement assure en base (procedure_id). On fusionne faits + pieces
  // en une seule liste d'elements.
  const elements = useMemo<Element[]>(() => {
    const elFaits: Element[] = faits.map((f) => ({
      nature: "Fait",
      date: f.date_evenement ?? "",
      intitule: f.titre,
      enfant: nomEnfant(f.child_id),
      categorie: f.implication_categorie ?? "",
    }));

    const elPieces: Element[] = pieces.map((p) => ({
      nature: "Pièce",
      date: p.date_document ?? "",
      intitule: p.libelle,
      enfant: nomEnfant(p.child_id),
      categorie: p.implication_categorie ?? "",
    }));

    return [...elFaits, ...elPieces];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faits, pieces, enfants]);

  // Regroupement par categorie d'implication, dans l'ordre des categories,
  // chaque groupe trie par date decroissante.
  const groupes = useMemo(() => {
    return CATEGORIES_IMPLICATION.map((cat) => {
      const items = elements
        .filter((el) => el.categorie === cat.valeur)
        .sort((a, b) => b.date.localeCompare(a.date));
      return { categorie: cat, items };
    }).filter((g) => g.items.length > 0);
  }, [elements]);

  const total = elements.length;

  // Export CSV : on aplatit les groupes pour garder l'ordre par categorie puis
  // par date. On n'exporte que des faits documentes par l'utilisateur, sans
  // aucune qualification. L'avertissement non qualifie est ajoute par construireCsv().
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
      contexte: { titre: "Implication parentale - elements documentes" },
    });
    const nomFichier = `implication-parentale-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    telechargerCsv(csv, nomFichier);
  }

  return (
    <AppShell
      titre="Implication parentale"
      description="Relire les faits et pieces marques pour suivre l implication parentale dans la procedure active."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/organiser" variant="secondary">
            Retour à Organiser
          </AppButtonLink>
          <AppButtonLink href="/chronologie" variant="secondary">
            Voir la chronologie
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Vue de synthèse factuelle">
          <p>
            Cette page rassemble uniquement des éléments factuels que vous avez
            vous-même documentés et marqués. Elle ne qualifie pas votre implication :
            ces éléments sont soumis à l&apos;appréciation du juge. À faire relire par
            un professionnel du droit si nécessaire.
          </p>
        </AppNotice>

        <AppCard>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--app-text-muted)]">
              {total} élément{total > 1 ? "s" : ""} marqué{total > 1 ? "s" : ""}.
            </span>
            <button
              onClick={exporterCsv}
              disabled={total === 0}
              className="ml-auto rounded-lg border border-[var(--app-border)] bg-white px-4 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Exporter en CSV
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-[#9B2C2C]">{message}</p>}
        </AppCard>

        {/* Sections par categorie */}
        <div className="space-y-8">
          {total === 0 && (
            <p className="text-sm text-[var(--app-text-muted)]">
              Aucun élément marqué pour cette procédure. Marquez un fait dans le
              journal ou une pièce dans les documents avec une catégorie
              d&apos;implication pour le voir apparaître ici.
            </p>
          )}

          {groupes.map((groupe) => (
            <div key={groupe.categorie.valeur} className="space-y-3">
              <h2 className="border-b border-[var(--app-border)] pb-1 text-base font-semibold text-[var(--app-text)]">
                {groupe.categorie.libelle}
                <span className="ml-2 text-sm font-normal text-[var(--app-text-muted)]">
                  ({groupe.items.length})
                </span>
              </h2>

              {groupe.items.map((el, i) => (
                <div
                  key={`${el.nature}-${i}`}
                  className="rounded-xl border border-[var(--app-border)] bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                      {el.nature}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-[var(--app-text)]">{el.intitule}</p>
                  <p className="text-sm text-[var(--app-text-muted)]">
                    {el.date || "Sans date"}
                    {el.enfant ? ` · ${el.enfant}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
