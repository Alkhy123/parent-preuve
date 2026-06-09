import Link from "next/link";
import PageHeader from "@/components/PageHeader";

// Page d'accueil affichée aux visiteurs NON connectés (présentation + invitation à se connecter).
export default function AccueilPublic() {
  const points = [
    {
      titre: "Centraliser",
      texte: "Frais, pension, justificatifs et événements réunis au même endroit.",
    },
    {
      titre: "Consigner les faits",
      texte: "Un journal daté et neutre, sans jugement de valeur.",
    },
    {
      titre: "Produire des documents",
      texte: "Exports, courriers et rapports clairs à partir de vos saisies.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Bienvenue"
        title="Parent Preuve"
        subtitle="Quand tout est confus, remettez de l'ordre dans les faits : un dossier clair, daté et factuel pour reprendre pied."
      />

      <div className="mx-auto max-w-3xl px-6 py-12 text-[#1F2733]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/connexion"
            className="rounded-lg bg-[#15233F] px-6 py-3 text-center text-sm font-medium text-[#F8F6F1] transition hover:bg-[#1d3057]"
          >
            Créer un compte
          </Link>
          <Link
            href="/connexion"
            className="rounded-lg border border-[#15233F]/30 px-6 py-3 text-center text-sm font-medium text-[#15233F] transition hover:border-[#15233F] hover:bg-[#15233F]/5"
          >
            Se connecter
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.titre} className="carte rounded-xl bg-white p-5">
              <h2 className="font-display text-lg text-[#15233F]">{p.titre}</h2>
              <p className="mt-2 text-sm">{p.texte}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-[#1F2733]/70">
          Parent Preuve est une aide à l&apos;organisation d&apos;un dossier factuel.
          L&apos;application ne fournit pas de conseil juridique et ne remplace pas un
          professionnel du droit. En savoir plus dans la{" "}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </>
  );
}