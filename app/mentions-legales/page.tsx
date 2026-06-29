import AppShell from "@/components/app/AppShell";
import AppButtonLink from "@/components/app/AppButtonLink";

export default function MentionsLegalesPage() {
  return (
    <AppShell
      titre="Mentions legales"
      description="Informations legales relatives a l edition et a l hebergement de Parent Preuve."
      actions={
        <AppButtonLink href="/" variant="secondary">
          Retour accueil
        </AppButtonLink>
      }
    >
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-10 text-[#1F2733] leading-relaxed">
        {/* Note discrète : posture éditoriale, sans effet "prototype". */}
        <p className="text-xs text-texte-doux">
          Ces mentions sont susceptibles d&apos;évoluer et pourront être revues par un
          professionnel du droit.
        </p>

        {/* MENTIONS LÉGALES */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl text-[#15233F]">Éditeur</h2>
            <p>
              L&apos;application <strong>Parent Preuve</strong> est éditée par
              <strong> Anthony Magny</strong>, particulier, dont l&apos;adresse est :
              12 cité Claude Debussy, appartement 7, 65000 Tarbes. Contact :{" "}
              <a className="underline" href="mailto:alkhyomgame@gmail.com">alkhyomgame@gmail.com</a>.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Directeur de la publication</h3>
            <p>Anthony Magny.</p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Hébergement de l&apos;application</h3>
            <p>
              L&apos;application web est hébergée par <strong>Vercel</strong>, dont les fonctions
              sont exécutées dans la région de Paris, France (cdg1) ;{" "}
              <a className="underline" href="https://vercel.com">vercel.com</a>.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Hébergement des données</h3>
            <p>
              Les données et fichiers sont hébergés par <strong>Supabase</strong>, sur une
              infrastructure située dans l&apos;Union européenne (région Irlande, eu-west-1).
            </p>
          </div>
        </section>

        {/* RENVOI VERS LA CONFIDENTIALITÉ */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Vos données personnelles</h2>
          <p>
            Le détail des données traitées, des finalités, des prestataires (dont Mistral AI
            pour les fonctions d&apos;intelligence artificielle), des durées de conservation et
            de vos droits figure dans notre{" "}
            <a href="/confidentialite" className="font-medium text-[#15233F] underline">
              politique de confidentialite
            </a>
            .
          </p>
        </section>

        {/* Rappel positionnement */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Avertissement</h2>
          <p>
            Parent Preuve est une aide à l&apos;organisation et à la rédaction. L&apos;application
            ne fournit pas de conseil juridique personnalisé et ne remplace ni un avocat, ni un
            médiateur, ni un professionnel du droit. Les documents générés à partir de vos
            saisies doivent être relus et vérifiés avant tout usage.
          </p>
        </section>
      </div>
    </AppShell>
  );
}