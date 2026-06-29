"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppShell from "@/components/app/AppShell";
import { setProcedureActiveIdLocal } from "@/lib/procedureActive";
import {
  supprimerDonneesEnfant,
  supprimerProcedureComplete,
} from "@/lib/suppressionDonnees";

type Enfant = {
  id: string;
  prenom_ou_alias: string;
  date_naissance: string | null;
  procedure_id: string | null;
};

type Procedure = {
  id: string;
  etiquette: string | null;
};

const NOUVELLE = "__nouvelle__";

export default function EnfantsPage() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [procedureChoisie, setProcedureChoisie] = useState<string>(NOUVELLE);
  const [etiquetteNouvelle, setEtiquetteNouvelle] = useState("");
  const [message, setMessage] = useState("");
  // Enfant en attente de confirmation de suppression (null = aucune demande).
  const [aSupprimer, setASupprimer] = useState<Enfant | null>(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  function libelleProcedure(p: Procedure) {
    return p.etiquette?.trim() ? p.etiquette : "Procédure sans nom";
  }

  async function chargerTout() {
    const [resEnfants, resProcedures] = await Promise.all([
      supabase
        .from("children")
        .select("id, prenom_ou_alias, date_naissance, procedure_id")
        .order("created_at", { ascending: true }),
      supabase
        .from("procedures")
        .select("id, etiquette")
        .order("created_at", { ascending: true }),
    ]);

    if (resEnfants.error) {
      setMessage("Erreur : " + resEnfants.error.message);
      return;
    }
    if (resProcedures.error) {
      setMessage("Erreur : " + resProcedures.error.message);
      return;
    }

    const procs = resProcedures.data ?? [];
    setEnfants(resEnfants.data ?? []);
    setProcedures(procs);

    setProcedureChoisie((actuel) => {
      if (actuel !== NOUVELLE && procs.some((p) => p.id === actuel)) return actuel;
      return procs.length > 0 ? procs[0].id : NOUVELLE;
    });
  }

  useEffect(() => {
    // Chargement async (setState après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerTout();
  }, []);

  async function ajouterEnfant() {
    setMessage("");

    if (!prenom.trim()) {
      setMessage("Le prénom (ou alias) est obligatoire.");
      return;
    }

    let procedureId = procedureChoisie;

    if (procedureChoisie === NOUVELLE) {
      if (!etiquetteNouvelle.trim()) {
        setMessage("Indiquez un nom pour la nouvelle procédure (l'autre parent).");
        return;
      }
      const { data, error } = await supabase
        .from("procedures")
        .insert({ etiquette: etiquetteNouvelle.trim() })
        .select("id")
        .single();

      if (error || !data) {
        setMessage("Erreur (création procédure) : " + (error?.message ?? "inconnue"));
        return;
      }
      procedureId = data.id;
    }

    const { error } = await supabase.from("children").insert({
      prenom_ou_alias: prenom.trim(),
      date_naissance: dateNaissance || null,
      procedure_id: procedureId,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    setPrenom("");
    setDateNaissance("");
    setEtiquetteNouvelle("");
    chargerTout();
  }

  // Vrai si l'enfant est le dernier (ou le seul) de sa procedure : sa suppression
  // entrainera celle de la procedure entiere.
  function estDernierEnfantDeSaProcedure(enfant: Enfant): boolean {
    if (!enfant.procedure_id) return false;
    const memeProc = enfants.filter((e) => e.procedure_id === enfant.procedure_id);
    return memeProc.length <= 1;
  }

  // Confirmation effective : supprime l'enfant et ses donnees. Si c'est le
  // dernier enfant de sa procedure, supprime la procedure entiere.
  async function confirmerSuppression() {
    const enfant = aSupprimer;
    if (!enfant) return;
    setSuppressionEnCours(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setMessage("Vous devez être connecté.");
      setSuppressionEnCours(false);
      return;
    }

    const dernier = estDernierEnfantDeSaProcedure(enfant);
    const resultat =
      dernier && enfant.procedure_id
        ? await supprimerProcedureComplete(userId, enfant.procedure_id)
        : await supprimerDonneesEnfant(userId, enfant.id);

    if (!resultat.ok) {
      setMessage("Suppression incomplète. " + resultat.erreurs.join(" · "));
      setSuppressionEnCours(false);
      return;
    }

    // Si la procedure active a pu disparaitre, on remet la selection a zero :
    // getProcedureActiveId retombera sur une procedure restante au prochain chargement.
    if (dernier) setProcedureActiveIdLocal(null);

    setASupprimer(null);
    setSuppressionEnCours(false);
    chargerTout();
  }

  return (
    <AppShell
      titre="Mes enfants"
      description="Ajouter les enfants concernes, les rattacher a une procedure et verifier les suppressions sensibles."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/dossier" variant="secondary">
            Retour Dossier
          </AppButtonLink>
          <AppButtonLink href="/procedure" variant="secondary">
            Procedure active
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        {message && (
          <p className="text-sm text-[var(--app-text-muted)]">{message}</p>
        )}

        {/* Formulaire d'ajout */}
        <AppCard titre="Ajouter un enfant">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--app-text)]">
                Prénom ou alias
              </label>
              <input
                type="text"
                placeholder="Ex : Enfant A"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--app-text)]">
                Date de naissance (facultatif)
              </label>
              <input
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--app-text)]">
                Procédure concernée (l&apos;autre parent)
              </label>
              <select
                value={procedureChoisie}
                onChange={(e) => setProcedureChoisie(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-white px-4 py-2"
              >
                {procedures.map((p) => (
                  <option key={p.id} value={p.id}>
                    Même autre parent que : {libelleProcedure(p)}
                  </option>
                ))}
                <option value={NOUVELLE}>+ Autre parent différent (nouvelle procédure)</option>
              </select>

              {procedureChoisie === NOUVELLE && (
                <input
                  type="text"
                  placeholder="Nom de l'autre parent (ex : Camille)"
                  value={etiquetteNouvelle}
                  onChange={(e) => setEtiquetteNouvelle(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--app-border)] px-4 py-2"
                />
              )}
            </div>

            <button
              onClick={ajouterEnfant}
              className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
            >
              Ajouter
            </button>
          </div>
        </AppCard>

        {/* Liste des enfants */}
        <AppCard titre="Enfants enregistrés">
          <div className="space-y-3">
            {enfants.length === 0 && (
              <p className="text-sm text-[var(--app-text-muted)]">Aucun enfant pour le moment.</p>
            )}
            {enfants.map((enfant) => {
              const proc = procedures.find((p) => p.id === enfant.procedure_id);
              const enConfirmation = aSupprimer?.id === enfant.id;
              const dernier = estDernierEnfantDeSaProcedure(enfant);
              return (
                <div
                  key={enfant.id}
                  className="rounded-xl border border-[var(--app-border)] bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--app-text)]">
                        {enfant.prenom_ou_alias}
                      </p>
                      {enfant.date_naissance && (
                        <p className="text-sm text-[var(--app-text-muted)]">
                          Né(e) le {enfant.date_naissance}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                        Procédure : {proc ? libelleProcedure(proc) : "non rattachée"}
                      </p>
                    </div>
                    {!enConfirmation && (
                      <button
                        onClick={() => {
                          setMessage("");
                          setASupprimer(enfant);
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  {enConfirmation && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                      {dernier ? (
                        <p className="text-sm text-[#9B2C2C]">
                          <strong>{enfant.prenom_ou_alias}</strong> est le seul enfant de
                          la procédure{" "}
                          <strong>{proc ? libelleProcedure(proc) : "concernée"}</strong>.
                          Le supprimer effacera <strong>toute la procédure</strong> : ses
                          faits, frais, pièces, preuves, règles, paiements et fichiers.
                          Action irréversible.
                        </p>
                      ) : (
                        <p className="text-sm text-[#9B2C2C]">
                          Seules les données de <strong>{enfant.prenom_ou_alias}</strong>{" "}
                          (faits, frais, pièces, preuves, règles de garde et fichiers)
                          seront supprimées. Les données des autres enfants de la
                          procédure sont conservées. Action irréversible.
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={confirmerSuppression}
                          disabled={suppressionEnCours}
                          className="rounded-lg bg-[#9B2C2C] px-4 py-2 text-sm text-white hover:bg-[#822525] disabled:opacity-60"
                        >
                          {suppressionEnCours
                            ? "Suppression..."
                            : dernier
                              ? "Supprimer la procédure entière"
                              : "Supprimer cet enfant et ses données"}
                        </button>
                        <button
                          onClick={() => setASupprimer(null)}
                          disabled={suppressionEnCours}
                          className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[#1F2733] hover:bg-slate-100"
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
        </AppCard>
      </div>
    </AppShell>
  );
}
