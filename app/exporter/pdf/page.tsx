import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

const ETAPES = [
  {
    numero: "1",
    titre: "Choisir la periode",
    description:
      "Definir une periode precise ou laisser les dates vides pour inclure toutes les donnees de la procedure active.",
  },
  {
    numero: "2",
    titre: "Controler le dossier",
    description:
      "Verifier les elements a completer, les pieces, les frais, les pensions et les preuves avant generation.",
  },
  {
    numero: "3",
    titre: "Generer le PDF",
    description:
      "Creer un document de travail qui regroupe les elements principaux du dossier dans un format lisible.",
  },
];

const CONTENU_PDF = [
  {
    titre: "Chronologie des evenements",
    texte:
      "Faits enregistres dans le journal, classes par date sur la periode choisie.",
  },
  {
    titre: "Frais partages",
    texte:
      "Depenses, categories, montants, parts dues et remboursements indiques.",
  },
  {
    titre: "Pension alimentaire",
    texte:
      "Montants dus, montants payes, dates de paiement et solde calcule.",
  },
  {
    titre: "Bordereau de pieces",
    texte:
      "Documents actifs rattaches a la procedure, avec date, categorie et enfant concerne si disponible.",
  },
  {
    titre: "Preuves photo",
    texte:
      "Bordereau des preuves photo avec titre, statut d'horodatage et empreinte technique si disponible.",
  },
  {
    titre: "Avertissement",
    texte:
      "Rappel que le document doit etre relu et ne remplace pas un conseil juridique.",
  },
];

const CONTROLES = [
  "La procedure active est-elle la bonne ?",
  "La periode selectionnee correspond-elle au besoin ?",
  "Les faits importants sont-ils bien renseignes ?",
  "Les frais et pensions sont-ils coherents ?",
  "Les pieces importantes sont-elles presentes ?",
  "Les preuves photo utiles sont-elles bien classees ?",
  "Le PDF genere a-t-il ete relu avant transmission ?",
];

export default function ExporterPdfPage() {
  return (
    <AppShell
      titre="Export PDF"
      description="Preparer un PDF de travail regroupant les principaux elements du dossier actif."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/exporter" variant="secondary">
            Retour Exporter
          </AppButtonLink>

          <AppButtonLink href="/export">
            Ouvrir l&apos;export PDF
          </AppButtonLink>
        </div>
      }
    >
      <div className="space-y-6">
        <AppNotice titre="Rappel important">
          <p>
            Le PDF genere est un document de travail base sur les donnees
            saisies. Il ne constitue pas un constat de commissaire de justice,
            ne remplace pas un conseil juridique et doit etre relu avant toute
            transmission.
          </p>
        </AppNotice>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
              Methode
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">
              Preparer le PDF en trois etapes
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {ETAPES.map((etape) => (
              <AppCard
                key={etape.numero}
                titre={`${etape.numero}. ${etape.titre}`}
                description={etape.description}
              />
            ))}
          </div>
        </section>

        <AppCard
          titre="Ce que le PDF peut contenir"
          description="Le contenu depend des donnees deja enregistrees dans la procedure active et de la periode choisie au moment de la generation."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {CONTENU_PDF.map((item) => (
              <article
                key={item.titre}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
              >
                <h3 className="font-semibold text-[var(--app-text)]">
                  {item.titre}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
                  {item.texte}
                </p>
              </article>
            ))}
          </div>
        </AppCard>

        <section className="grid gap-6 lg:grid-cols-2">
          <AppCard titre="Controles avant generation">
            <ul className="space-y-3 text-sm leading-6 text-[var(--app-text-muted)]">
              {CONTROLES.map((controle) => (
                <li key={controle} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{controle}</span>
                </li>
              ))}
            </ul>
          </AppCard>

          <AppCard titre="Ou se genere le PDF ?">
            <p className="text-sm leading-6 text-[var(--app-text-muted)]">
              La generation reste dans l&apos;outil existant{" "}
              <span className="font-semibold text-[var(--app-text)]">
                Export PDF
              </span>
              . Cette page sert uniquement de point d&apos;entree clair depuis
              l&apos;espace Exporter.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppButtonLink href="/export">
                Generer un PDF de travail
              </AppButtonLink>

              <AppButtonLink href="/chronologie" variant="secondary">
                Relire la chronologie
              </AppButtonLink>
            </div>
          </AppCard>
        </section>
      </div>
    </AppShell>
  );
}
