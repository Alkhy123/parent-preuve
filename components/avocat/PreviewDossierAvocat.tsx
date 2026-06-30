// components/avocat/PreviewDossierAvocat.tsx
//
// Previsualisation du "Dossier de transmission a l'avocat" : composant PUREMENT
// presentationnel. Il recoit le rendu (sections -> blocs) deja produit par
// lib/avocat/rendreDossierAvocat et l'affiche. Aucun acces Supabase ici.

import type {
  RenduDossierAvocat,
  SectionRendue,
  BlocRendu,
} from "@/lib/avocat/types";

function Bloc({ bloc }: { bloc: BlocRendu }) {
  if (bloc.type === "paragraphe") {
    return <p className="text-sm text-[var(--app-text)] whitespace-pre-line">{bloc.texte}</p>;
  }

  if (bloc.type === "champs") {
    return (
      <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {bloc.champs.map((c, i) => (
          <div key={i} className="text-sm">
            <dt className="text-[var(--app-text-muted)]">{c.label}</dt>
            <dd className="text-[var(--app-text)]">{c.valeur}</dd>
          </div>
        ))}
      </dl>
    );
  }

  // tableau
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--app-border)] text-[var(--app-text-muted)]">
            {bloc.entetes.map((h, i) => (
              <th key={i} className="py-2 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloc.lignes.map((ligne, i) => (
            <tr key={i} className="border-b border-[var(--app-border)] align-top">
              {ligne.map((cell, j) => (
                <td key={j} className="py-2 pr-3 text-[var(--app-text)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ section }: { section: SectionRendue }) {
  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      <h2 className="font-display text-lg text-[var(--app-text)]">{section.titre}</h2>
      <div className="mt-3 space-y-3">
        {section.blocs.map((bloc, i) => (
          <Bloc key={i} bloc={bloc} />
        ))}
      </div>
    </section>
  );
}

export default function PreviewDossierAvocat({
  rendu,
}: {
  rendu: RenduDossierAvocat;
}) {
  return (
    <div className="space-y-4">
      {rendu.sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </div>
  );
}
