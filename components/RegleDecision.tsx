'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getProcedureActiveId } from '@/lib/procedureActive';
import EncartPliable from '@/components/EncartPliable';

type ValeursInitialesDecision = {
  type_decision?: string | null;
  provisoire?: boolean | null;
  execution_provisoire?: boolean | null;
  susceptible_appel?: boolean | null;
  frappee_appel?: boolean | null;
  appel_date?: string | null;
  appel_juridiction?: string | null;
  date_decision?: string | null;
  date_signification?: string | null;
  date_audience_prochaine?: string | null;
  mise_en_etat?: boolean | null;
  mise_en_etat_details?: string | null;
  notes?: string | null;
};

const TYPES_DECISION = ['jugement', 'ordonnance', 'convention_homologuee', 'arret', 'autre'];

function dansListe(v: string | null | undefined, liste: string[]): string {
  return typeof v === 'string' && liste.includes(v) ? v : '';
}

function formDepuis(vi?: ValeursInitialesDecision) {
  const base = {
    type_decision: '',
    provisoire: false,
    execution_provisoire: false,
    susceptible_appel: false,
    frappee_appel: false,
    appel_date: '',
    appel_juridiction: '',
    date_decision: '',
    date_signification: '',
    date_audience_prochaine: '',
    mise_en_etat: false,
    mise_en_etat_details: '',
    notes: '',
  };
  if (!vi) return base;
  return {
    type_decision: dansListe(vi.type_decision, TYPES_DECISION),
    provisoire: vi.provisoire ?? false,
    execution_provisoire: vi.execution_provisoire ?? false,
    susceptible_appel: vi.susceptible_appel ?? false,
    frappee_appel: vi.frappee_appel ?? false,
    appel_date: vi.appel_date ?? '',
    appel_juridiction: vi.appel_juridiction ?? '',
    date_decision: vi.date_decision ?? '',
    date_signification: vi.date_signification ?? '',
    date_audience_prochaine: vi.date_audience_prochaine ?? '',
    mise_en_etat: vi.mise_en_etat ?? false,
    mise_en_etat_details: vi.mise_en_etat_details ?? '',
    notes: vi.notes ?? '',
  };
}

export default function RegleDecision({
  valeursInitiales,
  origineIA = false,
}: {
  valeursInitiales?: ValeursInitialesDecision;
  origineIA?: boolean;
} = {}) {
  const [chargement, setChargement] = useState(true);
  const [regleId, setRegleId] = useState<string | null>(null);
  const [procedureId, setProcedureId] = useState<string | null>(null);
  const [valide, setValide] = useState<boolean | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState('');
  const [signalFermeture, setSignalFermeture] = useState(0);

  const [form, setForm] = useState(() => formDepuis(valeursInitiales));

  function maj(champ: string, valeur: string | boolean) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  useEffect(() => {
    (async () => {
      const procId = await getProcedureActiveId();
      setProcedureId(procId);

      if (!procId) {
        setChargement(false);
        return;
      }

      const { data, error } = await supabase
        .from('decision_regle')
        .select('*')
        .eq('procedure_id', procId)
        .eq('actif', true)
        .maybeSingle();

      if (!error && data) {
        setRegleId(data.id);
        setValide(data.valide ?? null);
        if (!valeursInitiales) {
          setForm({
            type_decision: data.type_decision ?? '',
            provisoire: data.provisoire ?? false,
            execution_provisoire: data.execution_provisoire ?? false,
            susceptible_appel: data.susceptible_appel ?? false,
            frappee_appel: data.frappee_appel ?? false,
            appel_date: data.appel_date ?? '',
            appel_juridiction: data.appel_juridiction ?? '',
            date_decision: data.date_decision ?? '',
            date_signification: data.date_signification ?? '',
            date_audience_prochaine: data.date_audience_prochaine ?? '',
            mise_en_etat: data.mise_en_etat ?? false,
            mise_en_etat_details: data.mise_en_etat_details ?? '',
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

    const t = (v: string) => (v.trim() === '' ? null : v.trim());

    const payload = {
      type_decision: t(form.type_decision),
      provisoire: form.provisoire,
      execution_provisoire: form.execution_provisoire,
      susceptible_appel: form.susceptible_appel,
      frappee_appel: form.frappee_appel,
      appel_date: t(form.appel_date),
      appel_juridiction: t(form.appel_juridiction),
      date_decision: t(form.date_decision),
      date_signification: t(form.date_signification),
      date_audience_prochaine: t(form.date_audience_prochaine),
      mise_en_etat: form.mise_en_etat,
      mise_en_etat_details: t(form.mise_en_etat_details),
      notes: t(form.notes),
      ...(origineIA ? { source: 'ia', valide: false } : {}),
    };

    if (regleId) {
      const { error } = await supabase
        .from('decision_regle')
        .update(payload)
        .eq('id', regleId);
      if (error) setMessage('Erreur : ' + error.message);
      else {
        setValide(origineIA ? false : true);
        setMessage('Règle mise à jour.');
        if (!origineIA) setSignalFermeture((n) => n + 1);
      }
    } else {
      if (!procedureId) {
        setMessage("Aucune procédure active. Ajoutez d'abord un enfant dans « Mes enfants ».");
        setEnregistrement(false);
        return;
      }
      const { data, error } = await supabase
        .from('decision_regle')
        .insert({ ...payload, procedure_id: procedureId })
        .select('id')
        .single();
      if (error) setMessage('Erreur : ' + error.message);
      else {
        setRegleId(data.id);
        setValide(origineIA ? false : true);
        setMessage('Règle enregistrée.');
        if (!origineIA) setSignalFermeture((n) => n + 1);
      }
    }
    setEnregistrement(false);
  }

  async function valider() {
    if (!regleId) return;
    const { error } = await supabase
      .from('decision_regle')
      .update({ valide: true })
      .eq('id', regleId);
    if (error) setMessage('Échec de la validation.');
    else {
      setValide(true);
      setMessage('Règle validée.');
      setSignalFermeture((n) => n + 1);
    }
  }

  const champ = 'w-full rounded-md border border-gray-300 bg-white text-[#1F2733] px-3 py-2';
  const label = 'block text-sm font-medium text-[#15233F] mb-1';

  if (chargement) {
    return (
      <div className="rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-4 text-[#1F2733]">
        Chargement de la nature de la décision…
      </div>
    );
  }

  const LIBELLE_TYPE: Record<string, string> = {
    jugement: 'Jugement',
    ordonnance: 'Ordonnance',
    convention_homologuee: 'Convention homologuée',
    arret: 'Arrêt',
    autre: 'Autre',
  };
  const resumeDecision = [
    valide === false ? '⚠ à valider' : null,
    form.type_decision ? LIBELLE_TYPE[form.type_decision] : null,
    form.provisoire ? 'provisoire' : null,
    form.execution_provisoire ? 'exécution provisoire' : null,
    form.frappee_appel ? 'frappée d’appel' : null,
  ].filter(Boolean).join(' · ');

  const formulaire = (
    <div className="space-y-4">
      <div>
        <label className={label}>Nature de la décision</label>
        <select
          className={champ}
          value={form.type_decision}
          onChange={(e) => maj('type_decision', e.target.value)}
        >
          <option value="">— à préciser —</option>
          <option value="jugement">Jugement</option>
          <option value="ordonnance">Ordonnance</option>
          <option value="convention_homologuee">Convention homologuée</option>
          <option value="arret">Arrêt</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.provisoire}
          onChange={(e) => maj('provisoire', e.target.checked)}
        />
        Mesures provisoires (avant jugement au fond)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.execution_provisoire}
          onChange={(e) => maj('execution_provisoire', e.target.checked)}
        />
        Exécutoire par provision (s’applique même en cas d’appel)
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.susceptible_appel}
          onChange={(e) => maj('susceptible_appel', e.target.checked)}
        />
        Décision susceptible d’appel
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.frappee_appel}
          onChange={(e) => maj('frappee_appel', e.target.checked)}
        />
        Un appel a été interjeté
      </label>

      {form.frappee_appel && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Date de la déclaration d’appel</label>
            <input
              type="date"
              className={champ}
              value={form.appel_date}
              onChange={(e) => maj('appel_date', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Cour d’appel saisie</label>
            <input
              className={champ}
              placeholder="Ex. Cour d’appel de Pau"
              value={form.appel_juridiction}
              onChange={(e) => maj('appel_juridiction', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Date du prononcé</label>
          <input
            type="date"
            className={champ}
            value={form.date_decision}
            onChange={(e) => maj('date_decision', e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Date de signification / notification</label>
          <input
            type="date"
            className={champ}
            value={form.date_signification}
            onChange={(e) => maj('date_signification', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={label}>Prochaine audience</label>
        <input
          type="date"
          className={champ}
          value={form.date_audience_prochaine}
          onChange={(e) => maj('date_audience_prochaine', e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.mise_en_etat}
          onChange={(e) => maj('mise_en_etat', e.target.checked)}
        />
        Affaire en cours de mise en état
      </label>

      {form.mise_en_etat && (
        <div>
          <label className={label}>Détails de la mise en état</label>
          <textarea
            className={champ}
            rows={2}
            placeholder="Ex. clôture prévue, pièces à communiquer…"
            value={form.mise_en_etat_details}
            onChange={(e) => maj('mise_en_etat_details', e.target.value)}
          />
        </div>
      )}

      <div>
        <label className={label}>Notes (précisions particulières)</label>
        <textarea
          className={champ}
          rows={2}
          placeholder="Toute précision non couverte ci-dessus"
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
  );

  return (
    <EncartPliable
      titre="Nature et échéances de la décision"
      pliable={regleId !== null}
      replieParDefaut={regleId !== null && valide !== false && !valeursInitiales}
      resume={resumeDecision}
      signalFermeture={signalFermeture}
      idPersistance={procedureId ? `regle-decision:${procedureId}` : undefined}
    >
      {valide === false && (
        <div className="mb-4 rounded-lg border border-[#C2A24C]/60 bg-[#C2A24C]/10 p-3 text-sm">
          <p className="font-medium text-[#15233F]">Proposée par l&apos;IA — à vérifier</p>
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

      <p className="mb-4 text-sm text-[#1F2733]/80">
        Consigne ici le <strong>statut procédural</strong> de la décision (provisoire, appel,
        exécution provisoire, mise en état). Ces informations factuelles ne constituent pas un
        conseil juridique.
      </p>

      {formulaire}
    </EncartPliable>
  );
}
