import ProchainesEcheances from "@/components/ProchainesEcheances";
import TableauDeBord from "@/components/TableauDeBord";
import PageHeader from "@/components/PageHeader";

export default function Home() {
  const sections = [
    { titre: "Journal", description: "Vos événements datés et factuels." },
    { titre: "Frais", description: "Frais, remboursements et soldes." },
    { titre: "Pension", description: "Paiements mensuels et retards." },
    { titre: "Documents", description: "Justificatifs, factures et captures." },
    { titre: "Dossier", description: "Vos exports PDF prêts à transmettre." },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Accueil"
        title="Parent Preuve"
        subtitle="Centralisez frais, pension, justificatifs et événements pour préparer un dossier clair, daté et factuel."
      />
      <main className="min-h-screen bg-[#F8F6F1] text-[#1F2733]">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="mt-10">
            <TableauDeBord />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <div
                key={section.titre}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-[#15233F]">
                  {section.titre}
                </h2>
                <p className="mt-1 text-slate-600">{section.description}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-slate-400">
            Bientôt disponible — version en construction.
          </p>

          <div className="mt-10">
            <ProchainesEcheances />
          </div>
        </div>
      </main>
    </>
  );
}