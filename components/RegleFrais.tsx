'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { euros } from '@/lib/dossierCalculs';
import EncartPliable from '@/components/EncartPliable';

// Valeurs proposées par l'IA, au format "règle" (nombres / booléens / null) —
// MÊME convention que ReglePension. Le hub passe la règle telle quelle ; la
// conversion vers le formulaire (chaînes) est faite ici, dans formDepuis().
type ValeursInitialesFrais = {
  categories_couvertes?: string | null;
  part_moi_pourcentage?: number | null;
  part_autre_pourcentage?: number | null;
  accord_prealable_requis?: boolean | null;
  accord_prealable_seuil?: number | null;
  delai_remboursement_jours?: number | null;
  justificatif_obligatoire?: boolean | null;
  s_ajoute_a_pension?: boolean | null;
  notes?: string | null;
};

// Construit l'état du formulaire (chaînes) à partir des valeurs IA (règle).
// Les booléens absents (null) retombent sur le défaut manuel.
function formDepuis(vi?: ValeursInitialesFrais) {
  const base = {
    categories_couvertes: '',
    part_moi_pourcentage: '',
    part_autre_pourcentage: '',
    accord_prealable_requis: false,
    accord_prealable_seuil: '',
    delai_remboursement_jours: '',
    justificatif_obligatoire: true,
    s_ajoute_a_pension: false,
    notes: '',
  };
  if (!vi) return base;
  return {
    categories_couvertes: vi.categories_couvertes ?? '',
    part_moi_pourcentage:
      vi.part_moi_pourcentage != null ? String(vi.part_moi_pourcentage) : '',
    part_autre_pourcentage:
      vi.part_autre_pourcentage != null ? String(vi.part_autre_pourcentage) : '',
    accord_prealable_requis: vi.accord_prealable_requis ?? false,
    accord_prealable_seuil:
      vi.accord_prealable_seuil != null ? String(vi.accord_prealable_seuil) : '',
    delai_remboursement_jours:
      vi.delai_remboursement_jours != null ? String(vi.delai_remboursement_jours) : '',
    justificatif_obligatoire: vi.justificatif_obligatoire ?? true,
    s_ajoute_a_pension: vi.s_ajoute_a_pension ?? false,
    notes: vi.notes ?? '',
  };
}

export default function RegleFrais({
  valeursInitiales,
  origineIA = false,
}: {
  valeursInitiales?: ValeursInitialesFrais;
  origineIA?: boolean;
} = {}) {
  const [chargement, setChargement] = useState(true);
  const [regleId, setRegleId] = useState<string | null>(null);
  const [valide, setValide] = useState<boolean | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState('');

  // Si l'IA a pré-rempli des valeurs, le formulaire part directement pré-rempli.
  const [form, setForm] = useState(() => formDepuis(valeursInitiales));

  function maj(champ: string, valeur: string | boolean) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  // Convertit un champ texte en nombre (ou null si vide)
  function nombreOuNull(v: string): number | null {
    const t = v.trim();
    if (t === '') return null;
    const n = Number(t.replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  // Idem mais arrondi à l'entier (pour le délai en jours)
  function entierOuNull(v: string): number | null {
    const n = nombreOuNull(v);
    return n === null ? null : Math.round(n);
  }

  // Au chargement : on va chercher la règle active (s'il y en a une)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('frais_regle')
        .select('*')
        .eq('actif', true)
        .maybeSingle();

      if (!error && data) {
        setRegleId(data.id);
        setValide(data.valide ?? null);
        // Si l'IA a pré-rempli le formulaire, on NE l'écrase PAS avec la base :
        // on garde la proposition à relire. (Même logique que ReglePension.)
        if (!valeursInitiales) {
          setForm({
            categories_couvertes: data.categories_couvertes ?? '',
            part_moi_pourcentage: data.part_moi_pourcentage?.toString() ?? '',
            part_autre_pourcentage: data.part_autre_pourcentage?.toString() ?? '',
            accord_prealable_requis: data.accord_prealable_requis ?? false,
            accord_prealable_seuil: data.accord_prealable_seuil?.toString() ?? '',
            delai_remboursement_jours: data.delai_remboursement_jours?.toString() ?? '',
            justificatif_obligatoire: data.justificatif_obligatoire ?? true,
            s_ajoute_a_pension: data.s_ajoute_a_pension ?? false,
            notes: data.notes ?? '',
          });
        }
      }
      setChargement(false);
    })();
  }, []);

  async function enregistrer() {
    setEnregistrement(true);
    setMessage('');

    const payload = {
      categories_couvertes: form.categories_couvertes.trim() || null,
      part_moi_pourcentage: nombreOuNull(form.part_moi_pourcentage),
      part_autre_pourcentage: nombreOuNull(form.part_autre_pourcentage),
      accord_prealable_requis: form.accord_prealable_requis,
      accord_prealable_seuil: nombreOuNull(form.accord_prealable_seuil),
      delai_remboursement_jours: entierOuNull(form.delai_remboursement_jours),
      justificatif_obligatoire: form.justificatif_obligatoire,
      s_ajoute_a_pension: form.s_ajoute_a_pension,
      notes: form.notes.trim() || null,
      // Saisie manuelle : on n'envoie pas source/valide/actif → defaults (manuel/true/true).
      // Proposition IA : on trace source='ia' et on marque "à valider".
      ...(origineIA ? { source: 'ia', valide: false } : {}),
    };

    if (regleId) {
      const { error } = await supabase
        .from('frais_regle')
        .update(payload)
        .eq('id', regleId);
      if (error) setMessage('Erreur : ' + error.message);
      else {
        setValide(origineIA ? false : true);
        setMessage('Règle mise à jour.');
      }
    } else {
      const { data, error } = await supabase
        .from('frais_regle')
        .insert(payload)
        .select('id')
        .single();
      if (error) setMessage('Erreur : ' + error.message);
      else {
        setRegleId(data.id);
        setValide(origineIA ? false : true);
        setMessage('Règle enregistrée.');
      }
    }
    setEnregistrement(false);
  }

  // Valider une règle proposée par l'IA (bascule valide = true).
  async function valider() {
    if (!regleId) return;
    const { error } = await supabase
      .from('frais_regle')
      .update({ valide: true })
      .eq('id', regleId);
    if (error) setMessage('Échec de la validation.');
    else {
      setValide(true);
      setMessage('Règle validée.');
    }
  }

  // Styles réutilisés
  const champ = 'w-full rounded-md border border-gray-300 bg-white text-[#1F2733] px-3 py-2';
  const label = 'block text-sm font-medium text-[#15233F] mb-1';

  if (chargement) {
    return (
      <div className="rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-4 text-[#1F2733]">
        Chargement de la règle de frais…
      </div>
    );
  }

  const resumeFrais = [
    valide === false ? '⚠ à valider' : null,
    form.part_moi_pourcentage && form.part_autre_pourcentage
      ? `${form.part_moi_pourcentage} % / ${form.part_autre_pourcentage} %`
      : null,
    form.accord_prealable_requis && form.accord_prealable_seuil.trim() !== ''
      ? `accord préalable au-delà de ${form.accord_prealable_seuil} €`
      : null,
    form.delai_remboursement_jours.trim() !== ''
      ? `remboursement sous ${form.delai_remboursement_jours} j`
      : null,
  ].filter(Boolean).join(' · ');

  return (
    <EncartPliable
      titre={regleId ? 'Règle de frais partagés' : 'Aucune règle de frais enregistrée'}
      pliable={regleId !== null}
      replieParDefaut={regleId !== null && valide !== false && !valeursInitiales}
      resume={resumeFrais}
    >
      {valide === false && (
        <div className="mb-4 rounded-lg border border-[#C2A24C]/60 bg-[#C2A24C]/10 p-3 text-sm">
          <p className="font-medium text-[#15233F]">Proposée par l'IA — à vérifier</p>
          <p className="mt-1 text-[#1F2733]/70">
            Relisez les informations ci-dessous. Si elles sont fidèles au jugement,
            cliquez sur « Valider cette règle » ; sinon, corrigez puis enregistrez à nouveau.
          </p>
          <button
            onClick={valider}
            className="mt-2 rounded-lg bg-[#15233F] px-4 py-1.5 text-sm text-[#F8F6F1] transition hover:bg-[#1d2f52]"
          >
            Valider cette règle
          </button>
        </div>
      )}

      <p className="mt-1 mb-4 text-sm text-[#1F2733]/80">
        Décris ici ce que prévoit le <strong>dispositif du jugement</strong> sur les frais
        partagés (frais exceptionnels). Ces informations factuelles ne constituent pas un
        conseil juridique.
      </p>

      {regleId && form.accord_prealable_seuil.trim() !== '' && (
        <p className="mb-4 text-sm text-[#15233F]">
          Accord préalable requis au-delà de{' '}
          <strong>{euros(Number(form.accord_prealable_seuil.replace(',', '.')))}</strong>.
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className={label}>Frais couverts par la règle</label>
          <textarea
            className={champ}
            rows={2}
            placeholder="Ex. frais médicaux non remboursés, scolarité, activités extra-scolaires"
            value={form.categories_couvertes}
            onChange={(e) => maj('categories_couvertes', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Ma part (%)</label>
            <input
              className={champ}
              inputMode="decimal"
              placeholder="50"
              value={form.part_moi_pourcentage}
              onChange={(e) => maj('part_moi_pourcentage', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Part de l'autre parent (%)</label>
            <input
              className={champ}
              inputMode="decimal"
              placeholder="50"
              value={form.part_autre_pourcentage}
              onChange={(e) => maj('part_autre_pourcentage', e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.accord_prealable_requis}
            onChange={(e) => maj('accord_prealable_requis', e.target.checked)}
          />
          Accord préalable des deux parents requis
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Seuil d'accord préalable (€)</label>
            <input
              className={champ}
              inputMode="decimal"
              placeholder="200"
              value={form.accord_prealable_seuil}
              onChange={(e) => maj('accord_prealable_seuil', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Délai de remboursement (jours)</label>
            <input
              className={champ}
              inputMode="numeric"
              placeholder="30"
              value={form.delai_remboursement_jours}
              onChange={(e) => maj('delai_remboursement_jours', e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.justificatif_obligatoire}
            onChange={(e) => maj('justificatif_obligatoire', e.target.checked)}
          />
          Justificatif obligatoire pour le remboursement
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.s_ajoute_a_pension}
            onChange={(e) => maj('s_ajoute_a_pension', e.target.checked)}
          />
          Ces frais s'ajoutent à la contribution (pension)
        </label>

        <div>
          <label className={label}>Notes (clauses particulières)</label>
          <textarea
            className={champ}
            rows={2}
            placeholder="Toute clause subtile du jugement non couverte ci-dessus"
            value={form.notes}
            onChange={(e) => maj('notes', e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={enregistrer}
            disabled={enregistrement}
            className="rounded-md bg-[#15233F] px-4 py-2 text-white disabled:opacity-50"
          >
            {enregistrement ? 'Enregistrement…' : 'Enregistrer la règle'}
          </button>
          {message && <span className="text-sm text-[#15233F]">{message}</span>}
        </div>
      </div>
    </EncartPliable>
  );
}