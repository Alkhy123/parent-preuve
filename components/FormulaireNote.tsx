'use client'

import { Volets, sectionsActives, Champ } from '@/lib/structureNote'
import { PrechargeNote } from '@/lib/prechargerNote'
import ReformulationIA from '@/components/ReformulationIA'

const TYPES_EDITABLES = ['texte_court', 'texte_libre', 'montant', 'date'] as const

function estEditable(c: Champ) {
  return (TYPES_EDITABLES as readonly string[]).includes(c.type)
}

function texteSource(c: Champ): string {
  switch (c.type) {
    case 'liste_enfants': return 'Aucun enfant enregistré pour le moment.'
    case 'regle': return `À pré-remplir depuis : ${c.source} (aucune règle active trouvée).`
    case 'calcul': return `Calculé automatiquement depuis : ${c.source} — à venir.`
    case 'pieces': return 'Sélection de pièces (documents et preuves) — à venir.'
    case 'recapitulatif': return 'Assemblé depuis les volets actifs — à venir.'
    default: return ''
  }
}

export default function FormulaireNote({
  volets,
  precharge,
  valeurs,
  onChange,
}: {
  volets: Volets
  precharge: PrechargeNote
  valeurs: Record<string, string>
  onChange: (id: string, valeur: string) => void
}) {
  const sections = sectionsActives(volets)

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.id} className="rounded-xl bg-[#F8F6F1] p-5 carte">
          <h2 className="font-display text-lg text-[#15233F] mb-4">{section.titre}</h2>
          <div className="space-y-4">
            {section.champs.map((champ) => (
              <ChampNote
                key={champ.id}
                champ={champ}
                valeur={valeurs[champ.id] ?? ''}
                resume={precharge.resumes[champ.id]}
                onChange={(val) => onChange(champ.id, val)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ChampNote({
  champ,
  valeur,
  resume,
  onChange,
}: {
  champ: Champ
  valeur: string
  resume?: string
  onChange: (v: string) => void
}) {
  const editable = estEditable(champ)

  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2733] mb-1">
        {champ.libelle}
        {champ.obligatoire && <span className="text-[#9B2C2C]"> *</span>}
      </label>

      {!editable &&
        (resume ? (
          <div className="rounded-lg border border-[#15233F]/15 bg-white px-3 py-2 text-sm text-[#1F2733] whitespace-pre-line">
            {resume}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#15233F]/25 bg-white/60 px-3 py-2 text-sm text-[#1F2733]/60">
            {texteSource(champ)}
          </div>
        ))}

      {champ.type === 'texte_court' && (
        <input type="text" value={valeur} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#15233F]/20 bg-white px-3 py-2 text-sm focus:border-[#15233F] focus:outline-none" />
      )}

      {champ.type === 'montant' && (
        <input type="number" value={valeur} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#15233F]/20 bg-white px-3 py-2 text-sm focus:border-[#15233F] focus:outline-none" />
      )}

      {champ.type === 'date' && (
        <input type="date" value={valeur} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#15233F]/20 bg-white px-3 py-2 text-sm focus:border-[#15233F] focus:outline-none" />
      )}

      {champ.type === 'texte_libre' && (
        <>
          <textarea value={valeur} onChange={(e) => onChange(e.target.value)} rows={4}
            className="w-full rounded-lg border border-[#15233F]/20 bg-white px-3 py-2 text-sm focus:border-[#15233F] focus:outline-none" />
          {champ.reformulationIA && (
            <ReformulationIA texte={valeur} onAccepter={onChange} />
          )}
        </>
      )}

      {champ.aide && <p className="text-xs text-[#1F2733]/55 mt-1">{champ.aide}</p>}
    </div>
  )
}