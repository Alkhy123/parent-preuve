import type { ReactNode } from "react";

type AppNoticeProps = {
  titre: string;
  children: ReactNode;
};

export default function AppNotice({ titre, children }: AppNoticeProps) {
  return (
    <aside className="rounded-2xl border border-[var(--app-info-border)] bg-[var(--app-info-soft)] p-4">
      <h2 className="text-base font-semibold text-[var(--app-info)]">
        {titre}
      </h2>

      <div className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
        {children}
      </div>
    </aside>
  );
}
