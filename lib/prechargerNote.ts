// lib/prechargerNote.ts
// Lit les données du dossier pour pré-remplir la note, CLOISONNÉ sur la procédure active.
// Lecture seule, scoping RLS automatique (auth.uid() = user_id). Aucun log.
import { supabase } from '@/lib/supabase'
import { getProcedureActiveId, getEnfantsDeProcedureActive } from '@/lib/procedureActive'

export type PrechargeNote = {
  valeurs: Record<string, string>  // champs éditables (en-tête, parties, dates)
  resumes: Record<string, string>  // champs pré-remplis non éditables (règles, enfants)
}

export const prechargeVide: PrechargeNote = { valeurs: {}, resumes: {} }

// Une ligne lue en base, sans typage fort (colonnes variables selon la table).
type Ligne = Record<string, unknown>

// Coercition sûre d'une valeur inconnue en texte (vide si null/objet).
function s(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

function euros(n: unknown): string {
  if (n == null || n === '') return ''
  const x = typeof n === 'number' ? n : Number(n)
  return Number.isFinite(x) ? `${x} €` : ''
}

// Assemble les colonnes d'un même préfixe (ex. 'declarant_') sans en connaître les noms exacts.
function concatPrefixe(row: Ligne, prefixe: string): string {
  return Object.keys(row)
    .filter((k) => k.startsWith(prefixe))
    .map((k) => row[k])
    .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
    .join(' · ')
}

function resumeDecision(d: Ligne | null): string {
  if (!d) return ''
  const m: string[] = []
  if (d.type_decision) m.push(s(d.type_decision))
  if (d.date_decision) m.push(`prononcée le ${s(d.date_decision)}`)
  if (d.execution_provisoire) m.push('exécution provisoire')
  return m.join(' — ')
}

function resumePension(p: Ligne | null): string {
  if (!p) return ''
  const m: string[] = []
  const montant = p.montant_courant ?? p.montant_base
  if (montant != null) m.push(`Pension ${euros(montant)}/mois`)
  if (p.debiteur) m.push(`débiteur : ${p.debiteur === 'moi' ? 'vous' : "l'autre parent"}`)
  if (p.jour_echeance) m.push(`échéance le ${s(p.jour_echeance)}`)
  if (p.intermediation) m.push('intermédiation financière')
  return m.join(' · ')
}

function resumeFrais(f: Ligne | null): string {
  if (!f) return ''
  const m: string[] = []
  if (f.part_moi_pourcentage != null) m.push(`votre part : ${s(f.part_moi_pourcentage)}%`)
  if (f.part_autre_pourcentage != null) m.push(`autre parent : ${s(f.part_autre_pourcentage)}%`)
  if (f.accord_prealable_requis)
    m.push(`accord préalable${f.accord_prealable_seuil ? ` au-delà de ${euros(f.accord_prealable_seuil)}` : ''}`)
  return m.join(' · ')
}

function resumeDvh(d: Ligne | null): string {
  if (!d) return ''
  const m: string[] = []
  if (d.type_dvh) m.push(`type : ${s(d.type_dvh)}`)
  if (d.frequence) m.push(s(d.frequence))
  if (d.lieu_visite) m.push(`lieu : ${s(d.lieu_visite)}`)
  if (d.presence_tiers) m.push("présence d'un tiers")
  return m.join(' · ')
}

function resumeGarde(g: Ligne | null): string {
  if (!g) return ''
  const m: string[] = []
  if (g.type_garde) m.push(g.type_garde === 'weekend_sur_deux' ? 'un week-end sur deux' : s(g.type_garde))
  if (g.parent_principal) m.push(`parent principal : ${g.parent_principal === 'moi' ? 'vous' : "l'autre parent"}`)
  return m.join(' · ')
}

export async function prechargerNote(): Promise<PrechargeNote> {
  const valeurs: Record<string, string> = {}
  const resumes: Record<string, string> = {}

  const procId = await getProcedureActiveId()

  // Socle : le DÉCLARANT reste global.
  const { data: dossier } = await supabase.from('dossier').select('*').maybeSingle()
  if (dossier) {
    valeurs['declarant'] = concatPrefixe(dossier, 'declarant_')
  }

  // Autre parent + jugement : depuis la PROCÉDURE active.
  let procRow: Ligne | null = null
  if (procId) {
    const r = await supabase.from('procedures').select('*').eq('id', procId).maybeSingle()
    procRow = r.data
  }
  if (procRow) {
    valeurs['juridiction'] = s(procRow.jugement_juridiction)
    valeurs['numero_rg'] = s(procRow.jugement_numero_rg)
    valeurs['intitule'] = s(procRow.jugement_intitule)
    valeurs['autre_parent'] = concatPrefixe(procRow, 'autre_parent_')
  }

  // Enfants de la procédure active
  const enfants = await getEnfantsDeProcedureActive()
  if (enfants.length > 0) {
    resumes['enfants'] = enfants.map((e) => e.prenom_ou_alias).filter(Boolean).join(', ')
  }
  const idsProc = new Set(enfants.map((e) => e.id))

  // Sans procédure active, on s'arrête proprement (rien d'autre à pré-remplir).
  if (!procId) return { valeurs, resumes }

  // Règles actives DE LA PROCÉDURE ACTIVE
  const [decisionRes, pensionRes, fraisRes, dvhRes, gardeRes] = await Promise.all([
    supabase.from('decision_regle').select('*').eq('procedure_id', procId).eq('actif', true).maybeSingle(),
    supabase.from('pension_regle').select('*').eq('procedure_id', procId).eq('actif', true).maybeSingle(),
    supabase.from('frais_regle').select('*').eq('procedure_id', procId).eq('actif', true).maybeSingle(),
    supabase.from('dvh_regle').select('*').eq('procedure_id', procId).eq('actif', true).maybeSingle(),
    supabase.from('garde_regles').select('*').eq('actif', true),
  ])
  const decision = decisionRes.data
  const pension = pensionRes.data
  const frais = fraisRes.data
  const dvh = dvhRes.data
  // Garde : la table est par enfant ; on ne garde qu'une règle d'un enfant de la procédure active.
  const gardeListe = Array.isArray(gardeRes.data) ? gardeRes.data : []
  const garde =
    (gardeListe as Ligne[]).find(
      (g) => typeof g.enfant_id === 'string' && idsProc.has(g.enfant_id),
    ) ?? null

  if (decision) {
    valeurs['type_decision'] = decision.type_decision ?? ''
    valeurs['audience_prochaine'] = decision.date_audience_prochaine ?? ''
    resumes['decision_anterieure'] = resumeDecision(decision)
  }
  if (pension) resumes['pension_regle'] = resumePension(pension)
  if (frais) resumes['frais_regle'] = resumeFrais(frais)
  if (dvh) resumes['dvh_modalites'] = resumeDvh(dvh)
  if (garde) resumes['residence_modalite'] = resumeGarde(garde)

  const mesures = [resumePension(pension), resumeFrais(frais), resumeDvh(dvh)].filter(Boolean)
  if (mesures.length > 0) resumes['mesures_deja_fixees'] = mesures.join('\n')

  return { valeurs, resumes }
}
