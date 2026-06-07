import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Informations"
        title="Mentions légales"
        subtitle="Éditeur, hébergement, et accès à vos données personnelles."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-10 text-[#1F2733] leading-relaxed">
        {/* Avertissement */}
        <div className="rounded-lg border border-[#C2A24C] bg-white p-4 text-sm">
          <strong>Modèle à faire vérifier.</strong> Ce texte est un modèle de départ. Il doit
          être complété (champs entre crochets) et <strong>validé par un professionnel du
          droit</strong> avant une ouverture publique plus large.
        </div>

        {/* MENTIONS LÉGALES */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl text-[#15233F]">Éditeur</h2>
            <p>
              L&apos;application <strong>Parent Preuve</strong> est éditée par
              [NOM ou RAISON SOCIALE], [statut : particulier / auto-entrepreneur / société],
              [le cas échéant : capital social, n° SIREN/SIRET, RCS de …], dont l&apos;adresse
              est : [ADRESSE COMPLÈTE]. Contact : [EMAIL] — [TÉLÉPHONE éventuel].
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Directeur de la publication</h3>
            <p>[NOM DU DIRECTEUR DE LA PUBLICATION].</p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Hébergement de l&apos;application</h3>
            <p>
              L&apos;application web est hébergée par <strong>Vercel</strong>
              [ADRESSE / RÉGION à confirmer], <a className="underline" href="https://vercel.com">vercel.com</a>.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Hébergement des données</h3>
            <p>
              Les données et fichiers sont hébergés par <strong>Supabase</strong>, sur une
              infrastructure située dans l&apos;Union européenne [CONFIRMER LA RÉGION de votre
              projet Supabase, ex. Europe (Paris / Francfort)].
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
            <Link href="/confidentialite" className="font-medium text-[#15233F] underline">
              politique de confidentialité
            </Link>
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
    </>
  );
}