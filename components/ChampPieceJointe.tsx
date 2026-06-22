"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getEnfantsDeProcedureActive, getProcedureActiveId } from "@/lib/procedureActive";
import FormMessage from "@/components/ui/FormMessage";

// Vue allégée d'une pièce existante, pour la proposer à la sélection.
type DocLite = {
  id: string;
  libelle: string;
  categorie: string;
  child_id: string | null;
};

type Props = {
  // Identifiant de la pièce liée ("" = aucune). Contrôlé par le parent.
  value: string;
  onChange: (documentId: string) => void;
  // Enfant rattaché : sert à étiqueter une pièce téléversée et à filtrer la
  // liste des pièces existantes proposées (procédure active).
  childId: string | null;
  // Valeurs par défaut pour une pièce téléversée depuis ce contexte.
  libelleDefaut?: string;
  dateDefaut?: string;
  // Libellé de la case à cocher (personnalisable selon le module).
  question?: string;
};

// Champ réutilisable d'ajout / liaison d'une pièce justificative.
// - téléverse un fichier (bucket "justificatifs") et crée la pièce dans
//   `documents` (etat actif) : elle apparaît dans Documents et au coffre-fort ;
// - ou sélectionne une pièce existante de la procédure active.
// Le parent reçoit l'identifiant de la pièce via onChange et le persiste à sa
// guise (events.document_id, expenses.document_id, etc.).
export default function ChampPieceJointe({
  value,
  onChange,
  childId,
  libelleDefaut,
  dateDefaut,
  question = "Souhaitez-vous ajouter une pièce ?",
}: Props) {
  const [documents, setDocuments] = useState<DocLite[]>([]);
  const [idsProc, setIdsProc] = useState<Set<string>>(new Set());
  // L'option d'ajout n'apparaît que si l'utilisateur le souhaite (case cochée).
  // Pas de pièce = aucun blocage : l'élément reste valable et exportable.
  const [souhaite, setSouhaite] = useState(value !== "");
  const [montrerSelection, setMontrerSelection] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const champFichierRef = useRef<HTMLInputElement>(null);

  async function chargerDocuments() {
    const { data } = await supabase
      .from("documents")
      .select("id, libelle, categorie, child_id")
      .eq("etat", "actif")
      .order("created_at", { ascending: false });
    setDocuments((data ?? []) as DocLite[]);
  }

  useEffect(() => {
    // Chargements async (les setState surviennent après await, pas de cascade synchrone).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerDocuments();
    getEnfantsDeProcedureActive().then((es) =>
      setIdsProc(new Set(es.map((e) => e.id))),
    );
  }, []);

  // Pièces de la procédure active : enfant de la procédure OU sans enfant.
  const documentsProc = documents.filter(
    (d) => d.child_id === null || idsProc.has(d.child_id),
  );
  const docChoisi = documents.find((d) => d.id === value);

  // Téléverse un fichier puis crée la pièce dans `documents` et la sélectionne.
  async function televerser(fichier: File) {
    setErreur("");
    setUploadEnCours(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setErreur("Vous devez être connecté.");
        return;
      }

      // Cloisonnement : on résout la procédure AVANT l'upload pour ne pas
      // laisser de fichier orphelin si aucune procédure n'est active.
      const procedureId = await getProcedureActiveId();
      if (!procedureId) {
        setErreur(
          "Aucune procédure active. Créez d'abord une procédure avant d'ajouter une pièce.",
        );
        return;
      }

      const nomNettoye = fichier.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const chemin = `${userId}/${Date.now()}-${nomNettoye}`;

      const { error: uploadError } = await supabase.storage
        .from("justificatifs")
        .upload(chemin, fichier);
      if (uploadError) {
        setErreur("Erreur d'envoi : " + uploadError.message);
        return;
      }

      const { data: cree, error: insertError } = await supabase
        .from("documents")
        .insert({
          libelle: (libelleDefaut?.trim() || fichier.name).slice(0, 200),
          categorie: "Pièce jointe",
          chemin_fichier: chemin,
          date_document: dateDefaut || null,
          child_id: childId || null,
          procedure_id: procedureId,
        })
        .select("id")
        .single();
      if (insertError || !cree) {
        setErreur(
          "Erreur d'enregistrement : " + (insertError?.message ?? "inconnue"),
        );
        return;
      }

      onChange(cree.id);
      setMontrerSelection(false);
      await chargerDocuments();
    } finally {
      setUploadEnCours(false);
    }
  }

  function nomDocument(id: string) {
    const d = documents.find((doc) => doc.id === id);
    return d ? `${d.categorie} · ${d.libelle}` : "Pièce jointe";
  }

  // Affiché si l'utilisateur a coché la case OU si une pièce est déjà liée.
  const actif = souhaite || value !== "";

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={actif}
          onChange={(e) => {
            if (e.target.checked) {
              setSouhaite(true);
            } else {
              // On masque l'option et on détache la pièce (sans la supprimer).
              setSouhaite(false);
              onChange("");
            }
          }}
        />
        {question}
      </label>

      {!actif && (
        <p className="mt-2 text-xs text-slate-500">
          Aucune pièce n&apos;est obligatoire : l&apos;élément reste valable et
          exportable.
        </p>
      )}

      {actif && (
        <div className="mt-3">
      {value && docChoisi ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800">
            ✓ Pièce liée
          </span>
          <span className="text-sm text-slate-600">{nomDocument(value)}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-slate-700 hover:underline"
          >
            Retirer
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-xs text-slate-500">
            Facultatif : joignez une pièce (photo ou PDF) pour appuyer ce point.
            Elle est aussi rangée dans « Documents » et au coffre-fort.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => champFichierRef.current?.click()}
              disabled={uploadEnCours}
              className="rounded-lg bg-[#15233F] px-3 py-2 text-sm text-white hover:bg-[#1d2f52] disabled:opacity-50"
            >
              {uploadEnCours ? "Envoi en cours…" : "Téléverser une pièce"}
            </button>
            <button
              type="button"
              onClick={() => setMontrerSelection((v) => !v)}
              className="rounded-lg border border-[#15233F]/30 px-3 py-2 text-sm text-[#15233F] hover:bg-[#15233F]/5"
            >
              Sélectionner une pièce existante
            </button>
          </div>

          <input
            ref={champFichierRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) televerser(f);
              e.target.value = "";
            }}
          />

          <p className="text-xs text-slate-500">
            Le téléversement ouvre l&apos;appareil photo ou les fichiers de votre
            appareil.
          </p>

          <FormMessage message={erreur} type="erreur" />

          {montrerSelection && (
            <div>
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">— Choisir une pièce —</option>
                {documentsProc.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.categorie} · {d.libelle}
                  </option>
                ))}
              </select>
              {documentsProc.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Aucune pièce disponible. Ajoutez vos pièces dans « Documents ».
                </p>
              )}
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
