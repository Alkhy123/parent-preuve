import Link from "next/link";
import type { ReactNode } from "react";

type AppButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export default function AppButtonLink({
  href,
  children,
  variant = "primary",
}: AppButtonLinkProps) {
  const classes =
    variant === "primary"
      ? "bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
      : "border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${classes}`}
    >
      {children}
    </Link>
  );
}
