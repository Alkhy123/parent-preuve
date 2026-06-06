import PageHeader from "@/components/PageHeader";

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Informations"
        title="Mentions légales & confidentialité"
        subtitle="Éditeur, hébergement et traitement de vos données personnelles."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-10 text-[#1F2733] leading-relaxed">
        {/* Avertissement */}
        <div className="carte rounded-lg border border-[#C2A24C] bg-white p-4 text-sm">
          <strong>Modèle à faire vérifier.</strong> Ce texte est un modèle de départ. Il doit
          être complété (champs entre crochets) et <strong>validé par un professionnel du
          droit</strong> avant toute mise en ligne publique.
        </div>

        {/* MENTIONS LÉGALES */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[#15233F]">Mentions légales</h2>

          <div>
            <h3 className="font-medium text-[#15233F]">Éditeur</h3>
            <p>
              L'application <strong>Parent Preuve</strong> est éditée par
              [NOM ou RAISON SOCIALE], [statut : particulier / auto-entrepreneur / société],
              [le cas échéant : capital social, n° SIREN/SIRET, RCS de …], dont l'adresse est :
              [ADRESSE COMPLÈTE]. Contact : [EMAIL] — [TÉLÉPHONE éventuel].
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Directeur de la publication</h3>
            <p>[NOM DU DIRECTEUR DE LA PUBLICATION].</p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Hébergement de l'application</h3>
            <p>
              [NOM DE L'HÉBERGEUR de l'application, ex. Vercel, OVHcloud…], [ADRESSE],
              [SITE / CONTACT].
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Hébergement des données</h3>
            <p>
              Les données et fichiers sont hébergés par <strong>Supabase</strong>, sur une
              infrastructure située dans l'Union européenne [CONFIRMER LA RÉGION de votre projet
              Supabase, ex. Europe (Paris / Francfort)].
            </p>
          </div>
        </section>

        {/* POLITIQUE DE CONFIDENTIALITÉ */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[#15233F]">Politique de confidentialité</h2>
          <p className="text-sm text-gray-500">Dernière mise à jour : [DATE].</p>

          <div>
            <h3 className="font-medium text-[#15233F]">Responsable du traitement</h3>
            <p>[NOM / RAISON SOCIALE], joignable à [EMAIL].</p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Données traitées</h3>
            <p>
              Selon votre usage : votre adresse e-mail (compte) ; les informations saisies sur
              vos enfants (prénom ou alias, éventuelle date de naissance) ; le journal
              d'événements ; les frais et pensions ; les documents et justificatifs ; les
              preuves photo et leurs métadonnées techniques (empreinte, dimensions, coordonnées
              GPS le cas échéant, heure) ; le socle de votre dossier (état civil des parents,
              référence du jugement) ; et la trace datée de vos consentements.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Finalités</h3>
            <p>
              Ces données servent uniquement à vous permettre d'organiser et de constituer un
              dossier factuel de coparentalité, et de générer des documents (exports, courriers,
              rapports de preuve). Aucune donnée n'est revendue ; aucune publicité ciblée n'est
              diffusée.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Base légale</h3>
            <p>
              Le traitement repose sur l'exécution du service que vous demandez. La fonction de
              reformulation par intelligence artificielle repose, en plus, sur votre
              <strong> consentement</strong>, recueilli et daté lors de sa première utilisation
              et retirable à tout moment.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Sous-traitants et destinataires</h3>
            <p>
              Vos données ne sont accessibles qu'à vous. Pour fonctionner, l'application s'appuie
              sur des prestataires techniques (sous-traitants au sens du RGPD) :
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Supabase</strong> — hébergement de la base de données et des fichiers
                (Union européenne).
              </li>
              <li>
                <strong>Mistral AI</strong> (société française, traitement en Union européenne)
                — uniquement pour la fonction de reformulation neutre, et seulement après votre
                consentement. Le texte transmis sert exclusivement à produire une version
                reformulée ; il n'est pas réutilisé pour entraîner les modèles du prestataire et
                n'est pas conservé de façon durable. [À ALIGNER sur votre contrat Mistral : DPA
                art. 28 et, le cas échéant, option « zéro rétention ».]
              </li>
              <li>[NOM DE L'HÉBERGEUR de l'application, si distinct de Supabase].</li>
            </ul>
            <p className="text-sm">
              Pour préserver la confidentialité de vos données les plus sensibles, n'insérez pas
              de données de santé ni d'extraits de jugement dans la fonction de reformulation.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Durée de conservation</h3>
            <p>
              Vos données sont conservées tant que votre compte est actif. Vous pouvez demander
              leur export ou leur suppression ; à la suppression du compte, les données associées
              sont effacées [PRÉCISER le délai éventuel].
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Sécurité</h3>
            <p>
              L'accès aux données est cloisonné par utilisateur (chacun n'accède qu'aux siennes).
              Les originaux des preuves photo ne sont accessibles que par des liens temporaires
              sécurisés. Les clés d'accès aux services d'IA restent côté serveur et ne sont
              jamais exposées dans le navigateur.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-[#15233F]">Vos droits</h3>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
              d'effacement, de limitation, d'opposition et de portabilité de vos données, ainsi
              que du droit de retirer votre consentement à tout moment. Pour les exercer :
              [EMAIL]. Vous pouvez aussi introduire une réclamation auprès de la CNIL
              (www.cnil.fr).
            </p>
          </div>
        </section>

        {/* Rappel positionnement */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl text-[#15233F]">Avertissement</h2>
          <p>
            Parent Preuve est une aide à l'organisation et à la rédaction. L'application ne
            fournit pas de conseil juridique personnalisé et ne remplace ni un avocat, ni un
            médiateur, ni un professionnel du droit. Les documents générés à partir de vos
            saisies doivent être relus et vérifiés avant tout usage.
          </p>
        </section>
      </div>
    </>
  );
}