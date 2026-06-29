import AppButtonLink from "@/components/app/AppButtonLink";
import AppCard from "@/components/app/AppCard";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

// Page d&apos;accueil affichee aux visiteurs NON connectes (presentation + invitation a se connecter).
export default function AccueilPublic() {
  const points = [
    {
      titre: "Centraliser",
      texte: "Frais, pension, justificatifs et evenements reunis au meme endroit.",
    },
    {
      titre: "Consigner les faits",
      texte: "Un journal date et neutre, sans jugement de valeur.",
    },
    {
      titre: "Produire des documents",
      texte: "Exports, courriers et rapports clairs a partir de vos saisies.",
    },
  ];

  return (
    <AppShell
      titre="Parent Preuve"
      description="Organiser les faits, pieces, frais et elements utiles d un dossier parental."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/connexion">Creer un compte</AppButtonLink>
          <AppButtonLink href="/connexion" variant="secondary">Se connecter</AppButtonLink>
        </div>
      }
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <AppCard key={p.titre} titre={p.titre} description={p.texte} />
          ))}
        </div>

        <AppNotice titre="Ce que Parent Preuve ne fait pas">
          Pas de conseil juridique ni de strategie, aucune promesse de recevabilite, aucun
          contact avec l&apos;autre parent. C&apos;est un outil d&apos;organisation factuelle,
          pas un avocat.
        </AppNotice>

        <p className="text-sm text-[#1F2733]/70">
          <span className="font-medium text-[#15233F]">Confidentialite :</span>{" "}
          vos donnees restent privees, cloisonnees par compte, hebergees dans l&apos;Union
          europeenne et jamais revendues. Details dans la{" "}
          <a href="/confidentialite" className="underline">
            politique de confidentialite
          </a>
          .
        </p>
      </div>
    </AppShell>
  );
}