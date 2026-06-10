// lib/prechargerNote.ts
// Lit les données déjà présentes dans le dossier pour pré-remplir la note.
// Lecture seule, scoping RLS automatique (auth.uid() = user_id). Aucun log.
import { supabase } from '@/lib/supabase'

export type PrechargeNote = {
  valeurs: Record<string, string>  // champs éditables (en-tête, parties, dates)
  resumes: Record<string, string>  // champs pré-remplis non éditables (règles, enfants)
}

export const prechargeVide: PrechargeNote = { valeurs: {}, resumes: {} }

function euros(n: number | null | undefined): string {
  return n == null ? '' : `${n} €`
}

// Assemble les colonnes d'un même préfixe (ex. 'declarant_') sans en connaître les noms exacts.
function concatPrefixe(row: Record<string, any>, prefixe: string): string {
  return Object.keys(row)
    .filter((k) => k.startsWith(prefixe))
    .map((k) => row[k])
    .filter((v) => typeof v === 'string' && v.trim() !== '')
    .join(' · ')
}

function resumeDecision(d: any): string {
  if (!d) return ''
  const m: string[] = []
  if (d.type_decision) m.push(d.type_decision)
  if (d.date_decision) m.push(`prononcée le ${d.date_decision}`)
  if (d.execution_provisoire) m.push('exécution provisoire')
  return m.join(' — ')
}

function resumePension(p: any): string {
  if (!p) return ''
  const m: string[] = []
  const montant = p.montant_courant ?? p.montant_base
  if (montant != null) m.push(`Pension ${euros(montant)}/mois`)
  if (p.debiteur) m.push(`débiteur : ${p.debiteur === 'moi' ? 'vous' : "l'autre parent"}`)
  if (p.jour_echeance) m.push(`échéance le ${p.jour_echeance}`)
  if (p.intermediation) m.push('intermédiation financière')
  return m.join(' · ')
}

function resumeFrais(f: any): string {
  if (!f) return ''
  const m: string[] = []
  if (f.part_moi_pourcentage != null) m.push(`votre part : ${f.part_moi_pourcentage}%`)
  if (f.part_autre_pourcentage != null) m.push(`autre parent : ${f.part_autre_pourcentage}%`)
  if (f.accord_prealable_requis)
    m.push(`accord préalable${f.accord_prealable_seuil ? ` au-delà de ${euros(f.accord_prealable_seuil)}` : ''}`)
  return m.join(' · ')
}

function resumeDvh(d: any): string {
  if (!d) return ''
  const m: string[] = []
  if (d.type_dvh) m.push(`type : ${d.type_dvh}`)
  if (d.frequence) m.push(d.frequence)
  if (d.lieu_visite) m.push(`lieu : ${d.lieu_visite}`)
  if (d.presence_tiers) m.push("présence d'un tiers")
  return m.join(' · ')
}

function resumeGarde(g: any): string {
  if (!g) return ''
  const m: string[] = []
  if (g.type_garde) m.push(g.type_garde === 'weekend_sur_deux' ? 'un week-end sur deux' : g.type_garde)
  if (g.parent_principal) m.push(`parent principal : ${g.parent_principal === 'moi' ? 'vous' : "l'autre parent"}`)
  return m.join(' · ')
}

export async function prechargerNote(): Promise<PrechargeNote> {
  const valeurs: Record<string, string> = {}
  const resumes: Record<string, string> = {}

  // Socle dossier (1 ligne / utilisateur)
  const { data: dossier } = await supabase.from('dossier').select('*').maybeSingle()
  if (dossier) {
    valeurs['juridiction'] = dossier.jugement_juridiction ?? ''
    valeurs['numero_rg'] = dossier.jugement_numero_rg ?? ''
    valeurs['intitule'] = dossier.jugement_intitule ?? ''
    valeurs['declarant'] = concatPrefixe(dossier, 'declarant_')
    valeurs['autre_parent'] = concatPrefixe(dossier, 'autre_parent_')
  }

  // Enfants
  const { data: enfants } = await supabase.from('children').select('prenom_ou_alias')
  if (enfants && enfants.length > 0) {
    resumes['enfants'] = enfants.map((e: any) => e.prenom_ou_alias).filter(Boolean).join(', ')
  }

  // Règles actives
  const [decisionRes, pensionRes, fraisRes, dvhRes, gardeRes] = await Promise.all([
    supabase.from('decision_regle').select('*').eq('actif', true).maybeSingle(),
    supabase.from('pension_regle').select('*').eq('actif', true).maybeSingle(),
    supabase.from('frais_regle').select('*').eq('actif', true).maybeSingle(),
    supabase.from('dvh_regle').select('*').eq('actif', true).maybeSingle(),
    supabase.from('garde_regles').select('*').eq('actif', true).limit(1),
  ])
  const decision = decisionRes.data
  const pension = pensionRes.data
  const frais = fraisRes.data
  const dvh = dvhRes.data
  const garde = Array.isArray(gardeRes.data) ? gardeRes.data[0] ?? null : null

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