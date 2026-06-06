"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";

type Enfant = {
  id: string;
  prenom_ou_alias: string;
  date_naissance: string | null;
};

export default function EnfantsPage() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [message, setMessage] = useState("");

  // Charge la liste des enfants depuis la base
  async function chargerEnfants() {
    const { data, error } = await supabase
      .from("children")
      .select("id, prenom_ou_alias, date_naissance")
      .order("created_at", { ascending: true });

    if (error) setMessage("Erreur : " + error.message);
    else setEnfants(data ?? []);
  }

  // Au chargement de la page, on récupère la liste
  useEffect(() => {
    chargerEnfants();
  }, []);

  async function ajouterEnfant() {
    setMessage("");
    if (!prenom.trim()) {
      setMessage("Le prénom (ou alias) est obligatoire.");
      return;
    }

    const { error } = await supabase.from("children").insert({
      prenom_ou_alias: prenom.trim(),
      date_naissance: dateNaissance || null,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setPrenom("");
      setDateNaissance("");
      chargerEnfants(); // on rafraîchit la liste
    }
  }

  async function supprimerEnfant(id: string) {
    const { error } = await supabase.from("children").delete().eq("id", id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerEnfants();
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Profils"
        title="Mes enfants"
        subtitle="Ajoutez chaque enfant concerné par votre coparentalité."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">

        {/* Formulaire d'ajout */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Prénom ou alias
              </label>
              <input
                type="text"
                placeholder="Ex : Enfant A"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date de naissance (facultatif)
              </label>
              <input
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>
            <button
              onClick={ajouterEnfant}
              className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52]"
            >
              Ajouter
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        </div>

        {/* Liste des enfants */}
        <div className="mt-8 space-y-3">
          {enfants.length === 0 && (
            <p className="text-slate-500">Aucun enfant pour le moment.</p>
          )}
          {enfants.map((enfant) => (
            <div
              key={enfant.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-[#15233F]">
                  {enfant.prenom_ou_alias}
                </p>
                {enfant.date_naissance && (
                  <p className="text-sm text-slate-500">
                    Né(e) le {enfant.date_naissance}
                  </p>
                )}
              </div>
              <button
                onClick={() => supprimerEnfant(enfant.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}