// components/MajServiceWorker.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function MajServiceWorker() {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [majDispo, setMajDispo] = useState(false);
  const [masque, setMasque] = useState(false);

  // Vrai uniquement après un clic volontaire sur "Recharger".
  // Empêche tout rechargement automatique non voulu.
  const aClique = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // On n'active le service worker qu'en production (jamais en dev local,
    // pour ne pas gêner le rechargement à chaud).
    if (process.env.NODE_ENV !== "production") return;

    let dejaRecharge = false;

    // Quand le nouveau service worker prend le contrôle, on recharge UNE fois,
    // mais SEULEMENT si l'utilisateur a cliqué sur "Recharger".
    const onControllerChange = () => {
      if (!aClique.current) return; // ignore la prise de contrôle initiale
      if (dejaRecharge) return;
      dejaRecharge = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((reg) => {
        setRegistration(reg);

        // Cas 1 : une nouvelle version est déjà en attente à l'ouverture.
        if (reg.waiting && navigator.serviceWorker.controller) {
          setMajDispo(true);
        }

        // Cas 2 : une nouvelle version arrive pendant que l'app est ouverte.
        reg.addEventListener("updatefound", () => {
          const nouveau = reg.installing;
          if (!nouveau) return;
          nouveau.addEventListener("statechange", () => {
            if (
              nouveau.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setMajDispo(true);
            }
          });
        });
      })
      .catch(() => {
        // Si l'enregistrement échoue, on ne bloque rien : l'app marche normalement.
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  function recharger() {
    aClique.current = true;
    const enAttente = registration?.waiting;
    if (enAttente) {
      // On demande au nouveau service worker de s'activer tout de suite.
      // Le rechargement suivra via "controllerchange".
      enAttente.postMessage("SKIP_WAITING");
    } else {
      window.location.reload();
    }
  }

  if (!majDispo || masque) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4"
    >
      <div className="flex w-full max-w-md items-center gap-3 rounded-xl bg-[#15233F] px-4 py-3 text-[#F8F6F1] shadow-lg">
        <p className="flex-1 text-sm leading-snug">
          Une nouvelle version est disponible.
        </p>
        <button
          type="button"
          onClick={recharger}
          className="shrink-0 rounded-lg bg-[#C2A24C] px-3 py-1.5 text-sm font-medium text-[#15233F]"
        >
          Recharger
        </button>
        <button
          type="button"
          onClick={() => setMasque(true)}
          aria-label="Masquer"
          className="shrink-0 px-1 text-lg leading-none text-[#F8F6F1]/70 hover:text-[#F8F6F1]"
        >
          ×
        </button>
      </div>
    </div>
  );
}