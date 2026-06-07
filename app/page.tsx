import Link from "next/link";
import ProchainesEcheances from "@/components/ProchainesEcheances";
import TableauDeBord from "@/components/TableauDeBord";
import PageHeader from "@/components/PageHeader";

export default function Home() {
  // Les 4 gestes du quotidien, toujours au même endroit.
  const actions = [
    { libelle: "Ajouter un fait", href: "/journal" },
    { libelle: "Nouvelle preuve", href: "/preuves/nouvelle" },
    { libelle: "Courrier", href: "/courriers" },
    { libelle: "Export PDF", href: "/export" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Accueil"
        title="Parent Preuve"
        subtitle="Centralisez frais, pension, justificatifs et événements pour préparer un dossier clair, daté et factuel."
      />
      <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="mt-10">
            <TableauDeBord />
          </div>

          <div className="mt-10">
            <h2 className="font-display text-xl text-[#15233F]">Actions rapides</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="carte rounded-xl border border-[#15233F]/20 bg-white px-4 py-4 text-center text-sm font-medium text-[#15233F] transition hover:border-[#15233F] hover:bg-[#15233F]/5"
                >
                  {action.libelle}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <ProchainesEcheances />
          </div>
        </div>
      </main>
    </>
  );
}