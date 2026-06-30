import { ReactNode } from "react";

type Props = {
  titre?: string;
  message: string;
  // Action facultative (bouton ou lien) proposée sous le message.
  action?: ReactNode;
};

// État vide partagé : carte sobre, centrée, avec une action suivante facultative.
export default function EmptyState({ titre, message, action }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center shadow-sm">
      {titre && <p className="font-medium text-[var(--app-text)]">{titre}</p>}
      <p className={`text-sm text-slate-500 ${titre ? "mt-1" : ""}`}>{message}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
