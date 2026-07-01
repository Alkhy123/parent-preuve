// components/secondary/SecondaryMetrics.tsx
//
// Rangée de métriques pour la variante Vue d'ensemble des pages secondaires.
// Affiche 3-4 chiffres clés tirés des données déjà chargées par la page —
// pas de requête Supabase supplémentaire. Purement présentationnel.

type MetricVariant = "neutre" | "success" | "warning" | "danger";

type MetricItem = {
  label: string;
  value: number | string;
  sous?: string;
  variant?: MetricVariant;
};

type SecondaryMetricsProps = {
  items: MetricItem[];
};

const VARIANT_CLASSES: Record<MetricVariant, string> = {
  neutre:  "text-[var(--app-text)]",
  success: "text-[var(--app-success,#2e6a4d)]",
  warning: "text-[var(--app-warning,#92400e)]",
  danger:  "text-[var(--app-danger,#9b2c2c)]",
};

export default function SecondaryMetrics({ items }: SecondaryMetricsProps) {
  return (
    <div className={`grid gap-3 ${items.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
      {items.map((item) => {
        const couleurClasse = VARIANT_CLASSES[item.variant ?? "neutre"];
        return (
          <div
            key={item.label}
            className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3"
          >
            <p className={`text-2xl font-bold ${couleurClasse}`}>
              {item.value}
            </p>
            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{item.label}</p>
            {item.sous ? (
              <p className={`mt-0.5 text-xs font-medium ${couleurClasse}`}>{item.sous}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
