"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import ProchainesEcheances from "@/components/ProchainesEcheances";
import AccueilPublic from "@/components/AccueilPublic";
import WidgetActionsPrioritaires from "@/components/WidgetActionsPrioritaires";
import WidgetProchaineAction from "@/components/WidgetProchaineAction";
import WidgetOnboardingPrioritaire from "@/components/WidgetOnboardingPrioritaire";
import AppShell from "@/components/app/AppShell";
import { Icon, type IconName } from "@/components/apercu/icones";
import { supabase } from "@/lib/supabase";
import { getProcedureActiveId } from "@/lib/procedureActive";
import {
  euros,
  totauxFrais,
  totauxPension,
  type FraisCalcul,
  type PensionCalcul,
} from "@/lib/dossierCalculs";

export default function Home() {
  const [connecte, setConnecte] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  if (connecte === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-[#1F2733]">
        Chargement...
      </div>
    );
  }

  if (!connecte) {
    return <AccueilPublic />;
  }

  return (
    <AppShell
      activeModule="dashboard"
      title="Tableau de bord"
      subtitle="Vue d'ensemble de votre procédure active."
      copilotContext="dashboard"
      actions={
        <Link
          href="/export"
          className="hidden items-center rounded-lg px-3 py-2 text-sm font-semibold text-white transition md:inline-flex"
          style={{ backgroundColor: "var(--app-primary)" }}
        >
          Exporter le dossier
        </Link>
      }
    >
      <div className="w-full">
        <div className="space-y-4">
          <WidgetProchaineAction />

          <div className="grid gap-4 lg:grid-cols-2">
            <WidgetActionsPrioritaires />
            <div className="min-w-0">
              <ProchainesEcheances />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <EvenementsRecents />
            <FraisPensionMois />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DocumentsRecents />
            <SaisieRapide />
          </div>

          <WidgetOnboardingPrioritaire />
        </div>
      </div>
    </AppShell>
  );
}

const ACTIONS_RAPIDES: { href: string; label: string; icon: IconName }[] = [
  { href: "/journal", label: "Noter un fait", icon: "journal" },
  { href: "/frais", label: "Ajouter une dépense", icon: "frais" },
  { href: "/documents", label: "Ajouter un document", icon: "documents" },
  { href: "/preuves", label: "Ajouter une preuve", icon: "preuves" },
];

type EvenementRecent = {
  id: string;
  titre: string;
  categorie: string | null;
  date_evenement: string;
  statut: string | null;
};

type DocumentRecent = {
  id: string;
  libelle: string;
  categorie: string | null;
  date_document: string | null;
  created_at: string | null;
};

type FraisMois = FraisCalcul & { date_frais: string | null };
type PensionMois = PensionCalcul & { mois_du: string | null };

function CarteAccueil({
  titre,
  icon,
  action,
  children,
}: {
  titre: string;
  icon?: IconName;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section
      className="min-h-[15rem] rounded-xl border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5"
      style={{
        backgroundColor: "var(--app-surface)",
        borderColor: "var(--app-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold tracking-normal" style={{ color: "var(--app-text)" }}>
          {icon && (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--app-primary-soft)", color: "var(--app-primary)" }}
            >
              <Icon name={icon} className="h-4 w-4" />
            </span>
          )}
          {titre}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 text-sm font-medium"
            style={{ color: "var(--app-primary)" }}
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EvenementsRecents() {
  const [items, setItems] = useState<EvenementRecent[] | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      const procId = await getProcedureActiveId();
      if (!procId) {
        if (!annule) setItems([]);
        return;
      }
      const { data } = await supabase
        .from("events")
        .select("id, titre, categorie, date_evenement, statut")
        .eq("procedure_id", procId)
        .order("date_evenement", { ascending: false })
        .limit(3);
      if (!annule) setItems((data ?? []) as EvenementRecent[]);
    })();
    return () => {
      annule = true;
    };
  }, []);

  return (
    <CarteAccueil titre="Événements récents" icon="journal" action={{ href: "/journal", label: "Journal" }}>
      {items === null ? (
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          Chargement des événements…
        </p>
      ) : items.length === 0 ? (
        <EtatVide
          texte="Aucun fait daté n'est encore ajouté à cette procédure."
          href="/journal"
          label="Ajouter un événement"
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border px-3 py-2.5"
              style={{
                borderColor: "var(--app-border)",
                backgroundColor: "var(--app-surface-muted)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                  {item.titre}
                </p>
                {item.categorie && (
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium"
                    style={{
                      borderColor: "var(--app-border)",
                      backgroundColor: "var(--app-surface)",
                      color: "var(--app-text-muted)",
                    }}
                  >
                    {item.categorie}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--app-text-muted)" }}>
                {formatDate(item.date_evenement)}
                {item.statut ? ` - ${item.statut}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </CarteAccueil>
  );
}

function FraisPensionMois() {
  const [etat, setEtat] = useState<{
    frais: ReturnType<typeof totauxFrais>;
    pension: ReturnType<typeof totauxPension>;
  } | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      const procId = await getProcedureActiveId();
      const mois = moisCourant();
      let frais: FraisMois[] = [];
      let pension: PensionMois[] = [];
      if (procId) {
        const [fraisRes, pensionRes] = await Promise.all([
          supabase
            .from("expenses")
            .select("part_autre, rembourse, date_frais")
            .eq("procedure_id", procId),
          supabase
            .from("pension_payments")
            .select("montant_du, montant_paye, mois_du")
            .eq("procedure_id", procId),
        ]);
        frais = ((fraisRes.data ?? []) as FraisMois[]).filter((f) =>
          (f.date_frais ?? "").startsWith(mois)
        );
        pension = ((pensionRes.data ?? []) as PensionMois[]).filter((p) =>
          (p.mois_du ?? "").startsWith(mois)
        );
      }
      if (!annule) {
        setEtat({
          frais: totauxFrais(frais),
          pension: totauxPension(pension),
        });
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  return (
    <CarteAccueil titre="Frais & pension du mois" icon="frais" action={{ href: "/resume-mois", label: "Détail" }}>
      {etat === null ? (
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          Chargement de la situation du mois…
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <SyntheseMontant label="Frais restants" value={euros(etat.frais.resteDu)} />
          <SyntheseMontant
            label="Pension solde"
            value={etat.pension.solde === 0 ? "À jour" : euros(etat.pension.solde)}
            alerte={etat.pension.solde > 0}
          />
          <p className="text-xs sm:col-span-2" style={{ color: "var(--app-text-muted)" }}>
            Montants calculés à partir de vos saisies, pour la procédure active.
          </p>
        </div>
      )}
    </CarteAccueil>
  );
}

function DocumentsRecents() {
  const [items, setItems] = useState<DocumentRecent[] | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      const procId = await getProcedureActiveId();
      if (!procId) {
        if (!annule) setItems([]);
        return;
      }
      const { data } = await supabase
        .from("documents")
        .select("id, libelle, categorie, date_document, created_at")
        .eq("procedure_id", procId)
        .eq("etat", "actif")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!annule) setItems((data ?? []) as DocumentRecent[]);
    })();
    return () => {
      annule = true;
    };
  }, []);

  return (
    <CarteAccueil titre="Documents récents" icon="documents" action={{ href: "/documents", label: "Documents" }}>
      {items === null ? (
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          Chargement des documents…
        </p>
      ) : items.length === 0 ? (
        <EtatVide
          texte="Aucun document actif n'est encore rangé dans cette procédure."
          href="/documents"
          label="Ajouter un document"
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                style={{
                  borderColor: "var(--app-border)",
                  backgroundColor: "var(--app-surface-muted)",
                  color: "var(--app-text-muted)",
                }}
              >
                <Icon name="documents" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                  {item.libelle}
                </span>
                <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                  {item.categorie ?? "Document"} - {formatDate(item.date_document ?? item.created_at)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </CarteAccueil>
  );
}

function SaisieRapide() {
  return (
    <CarteAccueil titre="Saisie rapide" icon="plus">
      <div className="grid gap-2 sm:grid-cols-2">
        {ACTIONS_RAPIDES.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex min-h-11 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: "var(--app-border)",
              backgroundColor: "var(--app-surface-muted)",
              color: "var(--app-text)",
            }}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--app-primary-soft)", color: "var(--app-primary)" }}
            >
              <Icon name={action.icon} className="h-4 w-4" />
            </span>
            {action.label}
          </Link>
        ))}
      </div>
    </CarteAccueil>
  );
}

function SyntheseMontant({
  label,
  value,
  alerte = false,
}: {
  label: string;
  value: string;
  alerte?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-4 py-3"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-surface-muted)",
      }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--app-text-muted)" }}>
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-semibold"
        style={{ color: alerte ? "var(--app-danger, #9B2C2C)" : "var(--app-text)" }}
      >
        {value}
      </p>
    </div>
  );
}

function EtatVide({ texte, href, label }: { texte: string; href: string; label: string }) {
  return (
    <div className="rounded-lg border border-dashed p-4" style={{ borderColor: "var(--app-border)" }}>
      <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
        {texte}
      </p>
      <Link
        href={href}
        className="mt-3 inline-flex rounded-lg px-3 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: "var(--app-primary)" }}
      >
        {label}
      </Link>
    </div>
  );
}

function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Date non renseignée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
