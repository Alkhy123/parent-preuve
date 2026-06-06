'use client';

import { useState, ReactNode } from 'react';

type Props = {
  titre: string;
  resume?: ReactNode;        // ligne courte affichée quand l'encart est replié
  pliable?: boolean;         // false → toujours déplié, sans bouton (cas "pas de règle")
  replieParDefaut?: boolean; // état initial quand c'est pliable
  children: ReactNode;
};

export default function EncartPliable({
  titre,
  resume,
  pliable = true,
  replieParDefaut = false,
  children,
}: Props) {
  const [replie, setReplie] = useState(pliable ? replieParDefaut : false);

  return (
    <div className="carte rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-5 text-[#1F2733]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl text-[#15233F]">{titre}</h2>
          {pliable && replie && resume && (
            <p className="mt-1 text-sm text-[#1F2733]/80">{resume}</p>
          )}
        </div>
        {pliable && (
          <button
            onClick={() => setReplie((v) => !v)}
            aria-expanded={!replie}
            className="shrink-0 rounded-md border border-[#15233F]/20 px-3 py-1 text-sm text-[#15233F] hover:bg-[#15233F]/5"
          >
            {replie ? 'Afficher ▾' : 'Réduire ▴'}
          </button>
        )}
      </div>

      {!replie && <div className="mt-4">{children}</div>}
    </div>
  );
}