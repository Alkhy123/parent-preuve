"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";

type Enfant = { id: string; prenom_ou_alias: string };

type Document = {
  id: string;
  libelle: string;
  categorie: string;
  chemin_fichier: string;
  date_document: string | null;
  child_id: string | null;
};

const CATEGORIES = ["Facture", "Certificat médical", "Capture d'écran", "Courrier", "Autre"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);

  const [libelle, setLibelle] = useState("");
  const [categorie, setCategorie] = useState("Autre");
  const [dateDocument, setDateDocument] = useState("");
  const [childId, setChildId] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);

  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");

  async function chargerEnfants() {
    const { data } = await supabase
      .from("children")
      .select("id, prenom_ou_alias")
      .order("created_at", { ascending: true });
    setEnfants(data ?? []);
  }

  async function chargerDocuments() {
    const { data, error } = await supabase
      .from("documents")
      .select("id, libelle, categorie, chemin_fichier, date_document, child_id")
      .order("created_at", { ascending: false });
    if (error) setMessage("Erreur : " + error.message);
    else setDocuments(data ?? []);
  }

  useEffect(() => {
    chargerEnfants();
    chargerDocuments();
  }, []);

  async function envoyerDocument() {
    setMessage("");
    if (!libelle.trim()) return setMessage("Le libellé est obligatoire.");
    if (!fichier) return setMessage("Veuillez choisir un fichier.");

    setEnCours(true);
    try {
      // 1) Qui est connecté ? (pour ranger le fichier dans SON dossier)
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setMessage("Vous devez être connecté.");
        return;
      }

      // 2) On fabrique un chemin unique : monId/horodatage-nomdufichier
      const nomNettoye = fichier.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const chemin = `${userId}/${Date.now()}-${nomNettoye}`;

      // 3) Envoi du fichier dans le bucket privé "justificatifs"
      const { error: uploadError } = await supabase.storage
        .from("justificatifs")
        .upload(chemin, fichier);
      if (uploadError) {
        setMessage("Erreur d'envoi : " + uploadError.message);
        return;
      }

      // 4) On enregistre la fiche du document dans la table
      const { error: insertError } = await supabase.from("documents").insert({
        libelle: libelle.trim(),
        categorie,
        chemin_fichier: chemin,
        date_document: dateDocument || null,
        child_id: childId || null,
      });
      if (insertError) {
        setMessage("Erreur d'enregistrement : " + insertError.message);
        return;
      }

      // 5) On remet le formulaire à zéro et on rafraîchit
      setLibelle(""); setCategorie("Autre"); setDateDocument("");
      setChildId(""); setFichier(null);
      (document.getElementById("champ-fichier") as HTMLInputElement).value = "";
      chargerDocuments();
    } finally {
      setEnCours(false);
    }
  }

  // Ouvre un fichier via un lien sécurisé valable 1 minute
  async function ouvrirDocument(chemin: string) {
    const { data, error } = await supabase.storage
      .from("justificatifs")
      .createSignedUrl(chemin, 60);
    if (error || !data) setMessage("Erreur : impossible d'ouvrir le fichier.");
    else window.open(data.signedUrl, "_blank");
  }

  async function supprimerDocument(doc: Document) {
    // On supprime le fichier dans Storage, puis la fiche en base
    await supabase.storage.from("justificatifs").remove([doc.chemin_fichier]);
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) setMessage("Erreur : " + error.message);
    else chargerDocuments();
  }

  function nomEnfant(id: string | null) {
    if (!id) return null;
    return enfants.find((e) => e.id === id)?.prenom_ou_alias ?? null;
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Pièces"
        title="Documents et justificatifs"
        subtitle="Stockez vos pièces en sécurité : factures, certificats, captures etc."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12">

        {/* Formulaire d'envoi */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Libellé</label>
            <input
              type="text" placeholder="Ex : Facture orthodontiste mars"
              value={libelle} onChange={(e) => setLibelle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Catégorie</label>
              <select
                value={categorie} onChange={(e) => setCategorie(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Enfant concerné</label>
              <select
                value={childId} onChange={(e) => setChildId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">— Aucun —</option>
                {enfants.map((e) => (
                  <option key={e.id} value={e.id}>{e.prenom_ou_alias}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date du document</label>
              <input
                type="date" value={dateDocument}
                onChange={(e) => setDateDocument(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Fichier</label>
              <input
                id="champ-fichier"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#15233F] file:px-4 file:py-2 file:text-white"
              />
            </div>
          </div>

          <button
            onClick={envoyerDocument}
            disabled={enCours}
            className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52] disabled:opacity-50"
          >
            {enCours ? "Envoi en cours…" : "Envoyer le document"}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>

        {/* Liste */}
        <div className="mt-8 space-y-3">
          {documents.length === 0 && (
            <p className="text-slate-500">Aucun document enregistré.</p>
          )}
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {doc.categorie}
                  </span>
                  <p className="mt-1.5 font-semibold text-[#15233F]">{doc.libelle}</p>
                  <p className="text-sm text-slate-500">
                    {doc.date_document ?? "Sans date"}
                    {nomEnfant(doc.child_id) ? ` · ${nomEnfant(doc.child_id)}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => ouvrirDocument(doc.chemin_fichier)}
                    className="text-sm text-slate-700 hover:underline"
                  >
                    Ouvrir
                  </button>
                  <button
                    onClick={() => supprimerDocument(doc)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}