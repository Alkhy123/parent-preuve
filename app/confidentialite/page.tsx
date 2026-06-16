import PageHeader from "@/components/PageHeader";

export default function ConfidentialitePage() {
  return (
    <>
      <PageHeader
        eyebrow="Vos données"
        title="Politique de confidentialité"
        subtitle="Quelles données l'application traite, pourquoi, pendant combien de temps, et quels sont vos droits."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-10 text-[#1F2733] leading-relaxed">
        {/* Avertissement modèle */}
        <div className="rounded-lg border border-[#C2A24C] bg-white p-4 text-sm">
          <strong>À faire relire.</strong> Ce texte décrit fidèlement le fonctionnement de
          l&apos;application. Il reste recommandé de le faire{" "}
          <strong>valider par un professionnel du droit</strong> avant une ouverture publique
          plus large.
        </div>

        <p className="text-sm text-gray-500">Dernière mise à jour : 16 juin 2026.</p>

        {/* Responsable */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Responsable du traitement</h2>
          <p>
            L&apos;application <strong>Parent Preuve</strong> est éditée et exploitée par
            Anthony Magny, joignable à l&apos;adresse{" "}
            <strong>
              <a className="underline" href="mailto:alkhyomgame@gmail.com">alkhyomgame@gmail.com</a>
            </strong>
            . Cette personne décide des finalités et des moyens du traitement de vos données.
          </p>
        </section>

        {/* Données traitées */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Données que l&apos;application traite</h2>
          <p>Selon votre usage, l&apos;application enregistre :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>votre adresse e-mail, pour votre compte et votre connexion ;</li>
            <li>
              les informations que vous saisissez sur vos enfants (prénom ou alias, et le cas
              échéant date de naissance) ;
            </li>
            <li>votre journal d&apos;événements, vos frais et vos pensions ;</li>
            <li>vos documents et justificatifs ;</li>
            <li>
              vos preuves photo et leurs métadonnées techniques : empreinte numérique,
              dimensions, horodatage, et coordonnées GPS lorsqu&apos;elles sont disponibles ;
            </li>
            <li>
              le socle de votre dossier (identité des parents, référence et nature de la
              décision de justice) et les règles que vous en tirez (pension, frais, droit de
              visite, décision) ;
            </li>
            <li>
              la trace datée de vos consentements à l&apos;intelligence artificielle, ainsi
              qu&apos;un journal technique de vos appels à ces fonctions (fonction utilisée et
              date, sans le contenu), uniquement pour faire respecter des limites
              d&apos;utilisation.
            </li>
          </ul>
          <p className="text-sm">
            L&apos;application n&apos;est pas conçue pour recevoir des données de santé : merci
            de ne pas en saisir.
          </p>
        </section>

        {/* Finalités */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">À quoi servent ces données</h2>
          <p>
            Elles servent uniquement à vous permettre d&apos;organiser et de constituer un
            dossier factuel de coparentalité, et de produire des documents à partir de vos
            saisies (exports, courriers, rapports de preuve). Vos données ne sont ni revendues,
            ni utilisées pour de la publicité.
          </p>
        </section>

        {/* Base légale */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Sur quelle base</h2>
          <p>
            L&apos;enregistrement des informations que vous saisissez repose sur
            l&apos;exécution du service que vous demandez. Les fonctions d&apos;intelligence
            artificielle reposent, en plus, sur votre <strong>consentement</strong> : il est
            demandé séparément pour chaque fonction, au moment de sa première utilisation, et
            peut être retiré à tout moment.
          </p>
        </section>

        {/* IA */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Intelligence artificielle</h2>
          <p>
            Trois fonctions optionnelles s&apos;appuient sur un prestataire d&apos;intelligence
            artificielle, <strong>Mistral AI</strong> (société française, traitement réalisé
            dans l&apos;Union européenne) :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>la reformulation neutre</strong> d&apos;un message : le texte que vous
              soumettez est transmis pour en proposer une version factuelle ;
            </li>
            <li>
              <strong>l&apos;analyse d&apos;une décision</strong> à partir d&apos;un texte que
              vous collez, et <strong>l&apos;import d&apos;un jugement au format PDF</strong> :
              le texte (ou le fichier, le cas échéant analysé pour en extraire le texte) est
              transmis afin de proposer une lecture structurée des règles qu&apos;il contient.
            </li>
          </ul>
          <p>
            Ces fonctions ne s&apos;activent qu&apos;<strong>après votre consentement</strong>,
            demandé séparément pour chacune. Le contenu transmis sert exclusivement à produire
            la proposition demandée. Selon les conditions du prestataire, les contenus envoyés à
            son interface de programmation ne sont pas utilisés pour entraîner ses modèles. Ce
            traitement est réalisé au sein de l&apos;Union européenne.
          </p>
          <p>
            Principe constant : <strong>l&apos;IA propose, vous validez</strong>. Aucune
            proposition issue de l&apos;IA n&apos;est enregistrée dans votre dossier sans votre
            relecture et votre validation. La fonction de reformulation est prévue pour des
            messages : n&apos;y insérez pas de données de santé.
          </p>
        </section>

        {/* Sous-traitants / hébergement */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Hébergement et prestataires</h2>
          <p>
            Vos données ne sont accessibles qu&apos;à vous. Pour fonctionner, l&apos;application
            s&apos;appuie sur des prestataires techniques (sous-traitants au sens du RGPD) :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> — hébergement de la base de données, de
              l&apos;authentification et des fichiers, sur une infrastructure située dans
              l&apos;Union européenne (région Irlande, eu-west-1).
            </li>
            <li>
              <strong>Vercel</strong> — hébergement et exécution de l&apos;application web
              (fonctions exécutées dans la région de Paris, France, cdg1).
            </li>
            <li>
              <strong>Mistral AI</strong> — uniquement pour les fonctions d&apos;intelligence
              artificielle décrites ci-dessus, et seulement après votre consentement (Union
              européenne).
            </li>
          </ul>
        </section>

        {/* Conservation / suppression */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Durée de conservation et suppression</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. Vous pouvez à tout
            moment supprimer votre compte : cette action efface vos données enregistrées dans
            l&apos;application (journal, frais, pensions, documents, preuves et leurs fichiers,
            règles, dossier) ainsi que votre compte. L&apos;effacement est immédiat dans
            l&apos;application ; les éventuelles copies techniques de sauvegarde de nos
            prestataires d&apos;hébergement sont supprimées dans un délai maximal de 30 jours.
          </p>
        </section>

        {/* Sécurité */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Sécurité</h2>
          <p>
            L&apos;accès aux données est cloisonné par utilisateur : chacun n&apos;accède
            qu&apos;aux siennes. Les fichiers (justificatifs, preuves) sont stockés de façon
            privée et ne sont consultables que par des liens temporaires sécurisés. Les échanges
            se font en connexion chiffrée. Les accès aux services d&apos;intelligence
            artificielle restent côté serveur et ne sont jamais exposés dans le navigateur, et
            ces fonctions ne sont accessibles qu&apos;à un utilisateur connecté.
          </p>
        </section>

        {/* Droits */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos
            données, ainsi que du droit de retirer votre consentement à tout moment. Pour les
            exercer, écrivez à{" "}
            <strong>
              <a className="underline" href="mailto:alkhyomgame@gmail.com">alkhyomgame@gmail.com</a>
            </strong>
            . Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
          </p>
        </section>

        {/* Positionnement */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Avertissement</h2>
          <p>
            Parent Preuve est une aide à l&apos;organisation et à la rédaction d&apos;un dossier
            factuel. L&apos;application ne fournit pas de conseil juridique personnalisé et ne
            remplace ni un avocat, ni un médiateur, ni un professionnel du droit. Les preuves
            photo constituent une preuve numérique renforcée, horodatée de façon non qualifiée ;
            elles ne constituent pas un constat de commissaire de justice. La force probante des
            éléments produits relève de l&apos;appréciation du juge. Les documents générés à
            partir de vos saisies doivent être relus et vérifiés avant tout usage.
          </p>
        </section>
      </div>
    </>
  );
}