'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getProcedureActiveId } from '@/lib/procedureActive';
import EncartPliable from '@/components/EncartPliable';

// Valeurs proposées par l'IA, au format "règle" — MÊME convention que RegleFrais.
// Le hub passe la règle telle quelle ; la conversion vers le formulaire (chaînes)
// est faite ici, dans formDepuis(), avec coercition des énumérations.
type ValeursInitialesDVH = {
  type_dvh?: string | null;
  titulaire?: string | null;
  lieu_visite?: string | null;
  presence_tiers?: boolean | null;
  tiers_details?: string | null;
  frequence?: string | null;
  duree?: string | null;
  duree_limitee?: boolean | null;
  clause_renonciation?: boolean | null;
  clause_renonciation_details?: string | null;
  remise_lieu?: string | null;
  vacances_partage?: string | null;
  notes?: string | null;
};

// Listes autorisées pour les menus déroulants (coercition sûre).
const TYPES_DVH = ['classique', 'mediatise', 'reduit', 'progressif', 'libre', 'suspendu', 'sans_dvh'];
const TITULAIRES = ['moi', 'autre'];
const LIEUX = ['domicile', 'espace_rencontre', 'tiers', 'autre'];

// Ne garde une valeur que si elle est dans la liste, sinon '' (— à préciser —).
function dansListe(v: string | null | undefined, liste: string[]): string {
  return typeof v === 'string' && liste.includes(v) ? v : '';
}

// Construit l'état du formulaire (chaînes) à partir des valeurs IA (règle).
function formDepuis(vi?: ValeursInitialesDVH) {
  const base = {
    type_dvh: '',
    titulaire: '',
    lieu_visite: '',
    presence_tiers: false,
    tiers_details: '',
    frequence: '',
    duree: '',
    duree_limitee: false,
    clause_renonciation: false,
    clause_renonciation_details: '',
    remise_lieu: '',
    vacances_partage: '',
    notes: '',
  };
  if (!vi) return base;
  return {
    type_dvh: dansListe(vi.type_dvh, TYPES_DVH),
    titulaire: dansListe(vi.titulaire, TITULAIRES),
    lieu_visite: dansListe(vi.lieu_visite, LIEUX),
    presence_tiers: vi.presence_tiers ?? false,
    tiers_details: vi.tiers_details ?? '',
    frequence: vi.frequence ?? '',
    duree: vi.duree ?? '',
    duree_limitee: vi.duree_limitee ?? false,
    clause_renonciation: vi.clause_renonciation ?? false,
    clause_renonciation_details: vi.clause_renonciation_details ?? '',
    remise_lieu: vi.remise_lieu ?? '',
    vacances_partage: vi.vacances_partage ?? '',
    notes: vi.notes ?? '',
  };
}

export default function RegleDVH({
  valeursInitiales,
  origineIA = false,
}: {
  valeursInitiales?: ValeursInitialesDVH;
  origineIA?: boolean;
} = {}) {
  const [chargement, setChargement] = useState(true);
  const [regleId, setRegleId] = useState<string | null>(null);
  const [procedureId, setProcedureId] = useState<string | null>(null);
  const [valide, setValide] = useState<boolean | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState('');

  // Si l'IA a pré-rempli des valeurs, le formulaire part directement pré-rempli.
  const [form, setForm] = useState(() => formDepuis(valeursInitiales));

  function maj(champ: string, valeur: string | boolean) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  // Au chargement : on résout la procédure active, puis sa règle de DVH.
  useEffect(() => {
    (async () => {
      const procId = await getProcedureActiveId();
      setProcedureId(procId);

      if (!procId) {
        setChargement(false);
        return;
      }

      const { data, error } = await supabase
        .from('dvh_regle')
        .select('*')
        .eq('procedure_id', procId)
        .eq('actif', true)
        .maybeSingle();

      if (!error && data) {
        setRegleId(data.id);
        setValide(data.valide ?? null);
        // Si l'IA a pré-rempli, on NE l'écrase PAS avec la base (proposition à relire).
        if (!valeursInitiales) {
          setForm({
            type_dvh: data.type_dvh ?? '',
            titulaire: data.titulaire ?? '',
            lieu_visite: data.lieu_visite ?? '',
            presence_tiers: data.presence_tiers ?? false,
            tiers_details: data.tiers_details ?? '',
            frequence: data.frequence ?? '',
            duree: data.duree ?? '',
            duree_limitee: data.duree_limitee ?? false,
            clause_renonciation: data.clause_renonciation ?? false,
            clause_renonciation_details: data.clause_renonciation_details ?? '',
            remise_lieu: data.remise_lieu ?? '',
            vacances_partage: data.vacances_partage ?? '',
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

    // Texte vide → null pour rester propre en base
    const t = (v: string) => (v.trim() === '' ? null : v.trim());

    const payload = {
      type_dvh: t(form.type_dvh),
      titulaire: t(form.titulaire),
      lieu_visite: t(form.lieu_visite),
      presence_tiers: form.presence_tiers,
      tiers_details: t(form.tiers_details),
      frequence: t(form.frequence),
      duree: t(form.duree),
      duree_limitee: form.duree_limitee,
      clause_renonciation: form.clause_renonciation,
      clause_renonciation_details: t(form.clause_renonciation_details),
      remise_lieu: t(form.remise_lieu),
      vacances_partage: t(form.vacances_partage),
      notes: t(form.notes),
      // Saisie manuelle : on n'envoie pas source/valide/actif → defaults (manuel/true/true).
      // Proposition IA : on trace source='ia' et on marque "à valider".
      ...(origineIA ? { source: 'ia', valide: false } : {}),
    };

    if (regleId) {
      const { error } = await supabase
        .from('dvh_regle')
        .update(payload)
        .eq('id', regleId);
      if (error) setMessage('Erreur : ' + error.message);
      else {
        setValide(origineIA ? false : true);
        setMessage('Règle mise à jour.');
      }
    } else {
      if (!procedureId) {
        setMessage("Aucune procédure active. Ajoutez d'abord un enfant dans « Mes enfants ».");
        setEnregistrement(false);
        return;
      }
      const { data, error } = await supabase
        .from('dvh_regle')
        .insert({ ...payload, procedure_id: procedureId })
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
      .from('dvh_regle')
      .update({ valide: true })
      .eq('id', regleId);
    if (error) setMessage('Échec de la validation.');
    else {
      setValide(true);
      setMessage('Règle validée.');
    }
  }

  // Styles réutilisés (identiques à RegleFrais)
  const champ = 'w-full rounded-md border border-gray-300 bg-white text-[#1F2733] px-3 py-2';
  const label = 'block text-sm font-medium text-[#15233F] mb-1';

  if (chargement) {
    return (
      <div className="rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-4 text-[#1F2733]">
        Chargement des modalités de DVH…
      </div>
    );
  }

  const LIBELLE_TYPE: Record<string, string> = {
    classique: 'Classique', mediatise: 'Médiatisé', reduit: 'Réduit',
    progressif: 'Progressif', libre: 'Libre', suspendu: 'Suspendu', sans_dvh: 'Sans DVH',
  };
  const resumeDVH = [
    valide === false ? '⚠ à valider' : null,
    form.type_dvh ? LIBELLE_TYPE[form.type_dvh] : null,
    form.presence_tiers ? 'tiers présent' : null,
    form.frequence || null,
  ].filter(Boolean).join(' · ');

  return (
    <EncartPliable
      titre={
        regleId
          ? 'Modalités de droit de visite et d’hébergement'
          : 'Aucune modalité de DVH enregistrée'
      }
      pliable={regleId !== null}
      replieParDefaut={regleId !== null && valide !== false && !valeursInitiales}
      resume={resumeDVH}
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
        Consigne ici ce que prévoit le <strong>dispositif du jugement</strong> sur le droit de
        visite et d’hébergement. Ces informations factuelles ne constituent pas un conseil
        juridique.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Nature du DVH</label>
            <select
              className={champ}
              value={form.type_dvh}
              onChange={(e) => maj('type_dvh', e.target.value)}
            >
              <option value="">— à préciser —</option>
              <option value="classique">Classique</option>
              <option value="mediatise">Médiatisé</option>
              <option value="reduit">Réduit</option>
              <option value="progressif">Progressif</option>
              <option value="libre">Libre</option>
              <option value="suspendu">Suspendu</option>
              <option value="sans_dvh">Sans DVH</option>
            </select>
          </div>
          <div>
            <label className={label}>Titulaire du droit</label>
            <select
              className={champ}
              value={form.titulaire}
              onChange={(e) => maj('titulaire', e.target.value)}
            >
              <option value="">— à préciser —</option>
              <option value="moi">Moi</option>
              <option value="autre">L’autre parent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Lieu des visites</label>
            <select
              className={champ}
              value={form.lieu_visite}
              onChange={(e) => maj('lieu_visite', e.target.value)}
            >
              <option value="">— à préciser —</option>
              <option value="domicile">Domicile</option>
              <option value="espace_rencontre">Espace rencontre</option>
              <option value="tiers">Chez un tiers</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className={label}>Lieu de remise des enfants</label>
            <input
              className={champ}
              placeholder="Ex. domicile, point rencontre…"
              value={form.remise_lieu}
              onChange={(e) => maj('remise_lieu', e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.presence_tiers}
            onChange={(e) => maj('presence_tiers', e.target.checked)}
          />
          Présence d’un tiers / espace rencontre obligatoire
        </label>

        {form.presence_tiers && (
          <div>
            <label className={label}>Détails du tiers / espace rencontre</label>
            <input
              className={champ}
              placeholder="Nom de l’espace rencontre, tiers de confiance…"
              value={form.tiers_details}
              onChange={(e) => maj('tiers_details', e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Fréquence</label>
            <input
              className={champ}
              placeholder="Ex. un samedi sur deux"
              value={form.frequence}
              onChange={(e) => maj('frequence', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Durée</label>
            <input
              className={champ}
              placeholder="Ex. de 10h à 18h, 2 heures…"
              value={form.duree}
              onChange={(e) => maj('duree', e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.duree_limitee}
            onChange={(e) => maj('duree_limitee', e.target.checked)}
          />
          DVH limité dans le temps / progressif (détailler dans les notes)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.clause_renonciation}
            onChange={(e) => maj('clause_renonciation', e.target.checked)}
          />
          Clause de renonciation en cas de non-exercice
        </label>

        {form.clause_renonciation && (
          <div>
            <label className={label}>Détails de la clause de renonciation</label>
            <textarea
              className={champ}
              rows={2}
              placeholder="Ex. à défaut d’exercice dans la première heure, réputé avoir renoncé pour la période"
              value={form.clause_renonciation_details}
              onChange={(e) => maj('clause_renonciation_details', e.target.value)}
            />
          </div>
        )}

        <div>
          <label className={label}>Partage des vacances scolaires</label>
          <textarea
            className={champ}
            rows={2}
            placeholder="Ex. 1re moitié années paires, 2e moitié années impaires"
            value={form.vacances_partage}
            onChange={(e) => maj('vacances_partage', e.target.value)}
          />
        </div>

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
