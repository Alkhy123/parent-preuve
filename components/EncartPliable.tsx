'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

type Props = {
  titre: string;
  resume?: ReactNode;          // ligne courte affichée quand l'encart est replié
  pliable?: boolean;           // false → toujours déplié, sans bouton
  replieParDefaut?: boolean;   // état initial quand c'est pliable
  idPersistance?: string;      // si défini, l'état (plié/déplié) est mémorisé sur l'appareil
  signalFermeture?: number;    // incrémenter cette valeur referme l'encart (ex. après enregistrement)
  children: ReactNode;
};

const PREFIXE = 'encart-replie:';

export default function EncartPliable({
  titre,
  resume,
  pliable = true,
  replieParDefaut = false,
  idPersistance,
  signalFermeture,
  children,
}: Props) {
  const [replie, setReplie] = useState(pliable ? replieParDefaut : false);
  const premierRendu = useRef(true);

  // Applique un état et le mémorise sur l'appareil si une persistance est demandée.
  function appliquerEtat(valeurRepliee: boolean) {
    setReplie(valeurRepliee);
    if (idPersistance) {
      try {
        localStorage.setItem(PREFIXE + idPersistance, String(valeurRepliee));
      } catch {
        /* localStorage indisponible : on ignore, l'état reste en mémoire */
      }
    }
  }

  // Au montage : si une persistance est demandée, on relit l'état mémorisé.
  // (lecture en effet, jamais au rendu serveur, pour éviter les écarts d'hydratation)
  useEffect(() => {
    if (!pliable || !idPersistance) return;
    try {
      const v = localStorage.getItem(PREFIXE + idPersistance);
      // Initialisation depuis le stockage local au montage (pas de cascade).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (v === 'true') setReplie(true);
      else if (v === 'false') setReplie(false);
    } catch {
      /* localStorage indisponible : on garde l'état par défaut */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Referme l'encart quand le parent change signalFermeture (ex. après un enregistrement).
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    // Réaction au signal du parent (ex. après enregistrement) ; pas de cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pliable) appliquerEtat(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalFermeture]);

  return (
    <div
      className="rounded-lg border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5"
      style={{
        backgroundColor: "var(--app-surface)",
        borderColor: "var(--app-border)",
        color: "var(--app-text)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{titre}</h2>
          {pliable && replie && resume && (
            <p className="mt-1 text-sm" style={{ color: "var(--app-text-muted)" }}>{resume}</p>
          )}
        </div>
        {pliable && (
          <button
            onClick={() => appliquerEtat(!replie)}
            aria-expanded={!replie}
            className="shrink-0 rounded-md border px-3 py-1 text-sm"
            style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
          >
            {replie ? 'Afficher ▾' : 'Réduire ▴'}
          </button>
        )}
      </div>

      {!replie && <div className="mt-4">{children}</div>}
    </div>
  );
}
