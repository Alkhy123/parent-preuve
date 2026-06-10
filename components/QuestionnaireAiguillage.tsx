'use client'

import { Volets } from '@/lib/structureNote'

type Props = {
  volets: Volets
  onChange: (v: Volets) => void
}

const VOLETS_OPTIONNELS: {
  cle: keyof Omit<Volets, 'procedure'>
  libelle: string
  aide: string
}[] = [
  { cle: 'autoriteParentale', libelle: 'Autorité parentale', aide: "Comment l'autorité parentale est exercée" },
  { cle: 'residence', libelle: 'Résidence des enfants', aide: 'Où vivent habituellement les enfants' },
  { cle: 'dvh', libelle: "Droit de visite et d'hébergement", aide: 'Les modalités de visite' },
  { cle: 'pension', libelle: 'Pension (contribution)', aide: "La contribution à l'entretien et à l'éducation" },
  { cle: 'fraisExceptionnels', libelle: 'Frais exceptionnels', aide: 'Le partage des frais exceptionnels' },
  { cle: 'demandesAccessoires', libelle: 'Demandes accessoires', aide: 'Passeport, scolarité, communication de pièces…' },
]

export default function QuestionnaireAiguillage({ volets, onChange }: Props) {
  function basculer(cle: keyof Omit<Volets, 'procedure'>) {
    onChange({ ...volets, [cle]: !volets[cle] })
  }
  function choisirProcedure(p: Volets['procedure']) {
    onChange({ ...volets, procedure: p })
  }

  return (
    <div className="space-y-6">
      {/* Type de procédure */}
      <div>
        <h2 className="font-display text-lg text-[#15233F] mb-2">Type de procédure</h2>
        <div className="flex flex-wrap gap-3">
          {(['hors_divorce', 'divorce'] as const).map((p) => {
            const actif = volets.procedure === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => choisirProcedure(p)}
                aria-pressed={actif}
                className={`rounded-lg px-4 py-2 text-sm border transition ${
                  actif
                    ? 'bg-[#15233F] text-white border-[#15233F]'
                    : 'bg-white text-[#1F2733] border-[#15233F]/20 hover:border-[#15233F]/40'
                }`}
              >
                {p === 'hors_divorce' ? 'Hors divorce' : 'Divorce'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Volets à inclure */}
      <div>
        <h2 className="font-display text-lg text-[#15233F] mb-1">Que souhaitez-vous aborder ?</h2>
        <p className="text-sm text-[#1F2733]/70 mb-3">
          Cochez les volets concernés. Vous pourrez les ajuster plus tard.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {VOLETS_OPTIONNELS.map(({ cle, libelle, aide }) => {
            const actif = volets[cle]
            return (
              <button
                key={cle}
                type="button"
                onClick={() => basculer(cle)}
                aria-pressed={actif}
                className={`text-left rounded-lg px-4 py-3 border transition ${
                  actif
                    ? 'bg-[#15233F] text-white border-[#15233F]'
                    : 'bg-[#F8F6F1] text-[#1F2733] border-[#15233F]/15 hover:border-[#15233F]/35'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{libelle}</span>
                  <span className={`text-xs ${actif ? 'text-[#C2A24C]' : 'text-[#15233F]/40'}`}>
                    {actif ? 'Inclus ✓' : 'Ajouter +'}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${actif ? 'text-white/70' : 'text-[#1F2733]/60'}`}>{aide}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}