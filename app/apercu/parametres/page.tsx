// app/apercu/parametres/page.tsx - APERCU. Habillage uniquement.

import AppShell, { type CopiloteContenu } from "@/components/apercu/AppShell";
import ThemeSelector from "@/components/theme/ThemeSelector";

const COPILOTE: CopiloteContenu = {
  module: "Param\u00e8tres",
  intro:
    "Des r\u00e9glages pour adapter votre espace. L'assistant propose, vous v\u00e9rifiez et validez.",
  suggestions: [
    {
      titre: "Changer le th\u00e8me",
      desc: "Adapter l'apparence \u00e0 votre confort de lecture.",
      icon: "parametres",
    },
    {
      titre: "G\u00e9rer les notifications",
      desc: "Choisir les rappels qui vous sont utiles.",
      icon: "bell",
    },
    {
      titre: "Confidentialit\u00e9",
      desc: "Comprendre la protection de vos donn\u00e9es.",
      icon: "shield",
    },
  ],
  conseil:
    "Ces r\u00e9glages modifient votre exp\u00e9rience, pas le contenu de votre dossier.",
};

export default function ApercuParametres() {
  return (
    <AppShell
      active="parametres"
      titre="Param\u00e8tres"
      sousTitre="R\u00e9glages de votre espace Parent Preuve."
      copilote={COPILOTE}
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          Apparence
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choisissez le style visuel de votre espace Parent Preuve. Le contenu
          du dossier n&apos;est pas modifi\u00e9.
        </p>

        <div className="mt-4">
          <ThemeSelector />
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Le th\u00e8me reste un r\u00e9glage local de confort visuel dans cet aper\u00e7u.
        </p>
      </section>
    </AppShell>
  );
}
