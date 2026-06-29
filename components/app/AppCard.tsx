import type { ReactNode } from "react";

type AppCardProps = {
  titre?: string;
  description?: string;
  children?: ReactNode;
};

export default function AppCard({
  titre,
  description,
  children,
}: AppCardProps) {
  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      {titre ? (
        <h2 className="text-lg font-semibold text-[var(--app-text)]">
          {titre}
        </h2>
      ) : null}

      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
          {description}
        </p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
