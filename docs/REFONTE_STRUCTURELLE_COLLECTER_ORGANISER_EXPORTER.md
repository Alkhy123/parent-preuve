# Parent Preuve — Refonte structurelle Collecter / Organiser / Exporter

## Objectif

Parent Preuve ne doit pas devenir une application de coparentalité classique avec une accumulation de modules visibles au même niveau.

La nouvelle structure doit présenter l'application comme un parcours simple :

**Collecter → Organiser → Exporter**

L'utilisateur doit comprendre immédiatement que Parent Preuve sert à :

1. collecter les faits, preuves, frais, pensions, documents et échanges ;
2. organiser ces éléments par dossier, enfant, procédure, date, thème et pièces liées ;
3. exporter un dossier clair sous forme de rapport, chronologie, tableau ou pack avocat.

---

## Positionnement produit

Parent Preuve est une application française de dossier parental conflictuel.

Elle aide un parent séparé à transformer les faits du quotidien en dossier clair, daté, structuré et exportable.

Parent Preuve n'est pas :

* une messagerie entre parents ;
* un réseau social parental ;
* un outil de conseil juridique ;
* un avocat IA ;
* un outil garantissant la recevabilité d'une preuve ;
* une application qui promet une décision favorable.

Parent Preuve est :

* un outil solo ;
* un outil factuel ;
* un outil de classement ;
* un outil de chronologie ;
* un outil d'export ;
* un assistant d'organisation documentaire.

---

## Promesse centrale

**Vous vivez les faits.
Parent Preuve les organise.**

Cette phrase doit guider la refonte UI, les textes d'accueil, les parcours utilisateurs et les futurs exports.

---

## Structure cible

La logique produit doit progressivement passer de :

* Journal ;
* Frais ;
* Documents ;
* Preuves ;
* Calendrier ;
* Courriers ;
* Exports ;
* Compte.

vers une structure plus lisible :

* Accueil ;
* Collecter ;
* Organiser ;
* Exporter ;
* Assistant IA ;
* Compte.

Les anciens modules ne doivent pas disparaître brutalement. Ils doivent être rangés progressivement dans ces trois grands espaces.

---

## Navigation cible

### Accueil

L'accueil doit expliquer en moins de 10 secondes ce que fait Parent Preuve.

Il doit mettre en avant trois grandes actions :

1. **Collecter un élément**
2. **Organiser mon dossier**
3. **Exporter mon dossier**

L'accueil doit aussi afficher :

* la prochaine action recommandée ;
* les derniers éléments ajoutés ;
* les alertes importantes ;
* les raccourcis utiles ;
* un accès clair à l'assistant IA.

---

### Collecter

L'espace **Collecter** regroupe les actions rapides.

Objectif : permettre à l'utilisateur d'ajouter un élément important en moins de 30 secondes.

Il doit permettre d'ajouter :

* un événement ;
* une preuve photo ;
* un document ;
* un frais ;
* un paiement de pension ;
* une échéance ;
* un échange ;
* une capture SMS, WhatsApp ou e-mail ;
* un incident ;
* une remise ou récupération d'enfant.

Cet espace doit être simple, rapide et rassurant. Il ne doit pas imposer un formulaire trop long dès le départ.

---

### Organiser

L'espace **Organiser** regroupe les espaces de classement.

Il doit permettre de gérer :

* les dossiers ;
* les enfants ;
* les procédures ;
* le journal ;
* le calendrier ;
* les documents ;
* les preuves ;
* les finances ;
* la chronologie ;
* les décisions de justice ;
* les obligations issues des décisions.

L'objectif est de transformer les éléments bruts en dossier structuré.

Chaque élément doit pouvoir être relié à :

* un dossier ;
* un enfant ;
* une procédure ;
* une date ;
* un thème ;
* une pièce jointe ;
* une décision ou obligation si nécessaire.

---

### Exporter

L'espace **Exporter** regroupe les sorties exploitables.

Il doit permettre de générer :

* un export PDF ;
* un courrier ;
* un rapport JAF ;
* une note avocat ;
* un bordereau de pièces ;
* un tableau des frais ;
* un tableau pension ;
* un pack avocat ;
* un export ZIP.

L'export est le résultat final visible de la valeur de Parent Preuve.

L'application ne doit pas seulement stocker. Elle doit aider à produire un dossier clair.

---

## Correspondance avec les modules existants

### Collecter

Regroupe les actions rapides actuellement dispersées :

* ajouter un événement du journal ;
* ajouter une preuve photo ;
* ajouter un document ;
* ajouter un frais ;
* ajouter une échéance calendrier ;
* ajouter une note ;
* importer un échange ;
* déclarer un incident.

---

### Organiser

Regroupe les modules de structuration :

* journal ;
* frais ;
* documents ;
* preuves ;
* calendrier ;
* dossiers ;
* procédures ;
* enfants ;
* chronologie ;
* décisions ;
* obligations.

---

### Exporter

Regroupe les modules de sortie :

* courriers ;
* exports PDF ;
* rapport ;
* pièces ;
* bordereau ;
* dossier complet ;
* pack avocat ;
* tableaux financiers.

---

## Règle technique importante

Une donnée ne doit pas être dupliquée entre Collecter, Organiser et Exporter.

Exemple :

Un frais médical de 45 € :

* **Collecter** : l'utilisateur l'ajoute rapidement ;
* **Organiser** : il le rattache à un enfant, une procédure et un justificatif ;
* **Exporter** : il apparaît dans le tableau des frais.

Le même objet métier doit être réutilisé dans plusieurs vues.

Il ne faut pas créer trois systèmes séparés. Il faut créer trois façons d'utiliser les mêmes données.

---

## Objectif UX

La refonte doit réduire l'effet "application fourre-tout".

L'utilisateur ne doit pas voir trop de modules au même niveau.

Il doit comprendre immédiatement :

* quoi ajouter ;
* où classer ;
* comment exporter.

La structure doit rester sobre, claire et mobile-first.

---

## Ordre de priorité des chantiers

### P0 — Sécurisation du travail sans Vercel

Objectif : pouvoir continuer à travailler même sans preview Vercel.

À faire :

* ajouter GitHub Actions ;
* vérifier lint, tests et build à chaque commit ;
* ne pas merger sur main tant que la CI n'est pas verte ;
* travailler par petites Pull Requests ;
* garder main stable.

---

### P1 — Accueil et navigation

Objectif : faire comprendre la promesse de Parent Preuve en moins de 10 secondes.

À faire :

* adapter l'accueil ;
* afficher trois cartes principales : Collecter, Organiser, Exporter ;
* ajouter les raccourcis vers les modules existants ;
* adapter la navigation desktop ;
* adapter la navigation mobile ;
* ne pas modifier la logique métier à cette étape.

Critère de réussite :

L'utilisateur comprend immédiatement que l'application sert à collecter, organiser et exporter un dossier parental.

---

### P2 — Pages passerelles

Créer trois pages simples :

* `/collecter`
* `/organiser`
* `/exporter`

Ces pages doivent d'abord servir de hubs vers l'existant.

Aucune refonte profonde de base de données à cette étape.

Chaque page doit présenter :

* une explication courte ;
* les actions principales ;
* des cartes de raccourcis ;
* un accès à l'assistant IA si pertinent.

---

### P3 — Collecte rapide

Créer une expérience d'ajout rapide.

Types d'éléments prioritaires :

* fait ;
* preuve ;
* document ;
* frais ;
* pension ;
* remise enfant ;
* incident ;
* échange.

Objectif :

Permettre d'ajouter un élément important en moins de 30 secondes.

L'utilisateur doit pouvoir compléter les détails plus tard dans Organiser.

---

### P4 — Chronologie intelligente

Créer ou améliorer une chronologie filtrable.

Filtres prioritaires :

* enfant ;
* procédure ;
* thème ;
* période ;
* type d'élément ;
* pièce liée.

La chronologie doit devenir le cœur du dossier.

Elle doit permettre de comprendre rapidement :

* ce qui s'est passé ;
* quand ;
* avec quelle preuve ;
* pour quel enfant ;
* dans quelle procédure.

---

### P5 — Rapport JAF / note avocat

Produire un export structuré.

Structure recommandée :

1. page de garde ;
2. résumé neutre ;
3. informations du dossier ;
4. chronologie ;
5. tableau des incidents ;
6. tableau des frais ;
7. tableau pension ;
8. liste des pièces ;
9. annexes ;
10. avertissement juridique.

Attention :

Parent Preuve ne doit jamais promettre qu'une preuve est recevable ou qu'une décision sera favorable.

Formulation recommandée :

Parent Preuve aide à produire un dossier structuré, daté, clair et exportable.

---

### P6 — Packs dossier

Préparer la monétisation des exports avancés.

Packs envisagés :

* Pack Chronologie ;
* Pack Pension / ARIPA ;
* Pack Frais ;
* Pack Dossier JAF ;
* Pack Avocat ;
* Pack Urgence audience.

Logique recommandée :

Aperçu gratuit → paiement → génération PDF/ZIP → téléchargement → conservation dans l'historique.

---

### P7 — Modules avancés

À traiter après stabilisation de la structure :

* import SMS / WhatsApp / e-mails ;
* import jugement ;
* extraction des obligations ;
* pointage remise enfant ;
* accès avocat lecture seule ;
* module ARIPA avancé ;
* demandes officielles traçables.

Ces modules sont importants, mais ils ne doivent pas être ajoutés avant que la structure Collecter / Organiser / Exporter soit claire.

---

## Garde-fous UX

Toujours privilégier :

* sobriété ;
* neutralité ;
* clarté ;
* langage factuel ;
* intérêt de l'enfant ;
* validation humaine ;
* accompagnement progressif.

Éviter :

* vocabulaire agressif ;
* promesse judiciaire ;
* termes anxiogènes ;
* surenchère de menus ;
* IA présentée comme experte juridique ;
* écrans trop chargés ;
* formulaires trop longs dès l'entrée.

---

## Garde-fous IA

L'assistant IA peut :

* aider à classer ;
* reformuler de manière neutre ;
* résumer ;
* préremplir ;
* suggérer une prochaine action documentaire ;
* aider à structurer une chronologie.

L'assistant IA ne doit pas :

* remplacer un avocat ;
* garantir la recevabilité d'une preuve ;
* promettre une issue judiciaire ;
* rédiger une stratégie juridique agressive ;
* inciter à collecter des preuves illégales ;
* affirmer qu'un document sera accepté par le juge.

---

## Garde-fous juridiques

Parent Preuve doit rester un outil d'organisation documentaire.

L'application doit éviter les promesses du type :

* "preuve garantie recevable" ;
* "dossier prêt à gagner" ;
* "validé par le JAF" ;
* "certifié juridiquement" si ce n'est pas réellement le cas ;
* "remplace un avocat".

Formulations préférées :

* "dossier structuré" ;
* "chronologie claire" ;
* "pièces organisées" ;
* "export exploitable" ;
* "à transmettre à votre avocat ou conseil" ;
* "aide à la préparation documentaire".

---

## Garde-fous techniques

Pour chaque chantier :

1. créer une branche dédiée ;
2. limiter le périmètre ;
3. ne pas casser les anciennes routes ;
4. garder les modules existants accessibles ;
5. vérifier lint, build et CI ;
6. tester desktop et mobile ;
7. éviter les duplications de données ;
8. conserver les garde-fous IA et juridiques.

---

## Méthode de développement recommandée

Pour chaque bloc :

1. lire le contexte projet ;
2. lire les fichiers concernés ;
3. modifier un périmètre limité ;
4. ajouter ou adapter les tests si possible ;
5. lancer la CI ;
6. corriger les erreurs ;
7. faire une validation visuelle ;
8. merger uniquement si tout est vert.

---

## Prochaine étape immédiate

Créer d'abord une couche de navigation et d'accueil autour de :

**Collecter / Organiser / Exporter**

Ne pas ajouter de grosses fonctionnalités tant que cette structure n'est pas posée.

La prochaine modification de code doit être limitée à :

* l'accueil ;
* la navigation ;
* la création des pages `/collecter`, `/organiser`, `/exporter` ;
* des cartes de raccourcis vers les modules existants.

Aucune modification profonde de la base de données n'est attendue à cette étape.
# Parent Preuve — Refonte structurelle Collecter / Organiser / Exporter

## Objectif

Parent Preuve ne doit pas devenir une application de coparentalité classique avec une accumulation de modules visibles au même niveau.

La nouvelle structure doit présenter l'application comme un parcours simple :

**Collecter → Organiser → Exporter**

L'utilisateur doit comprendre immédiatement que Parent Preuve sert à :

1. collecter les faits, preuves, frais, pensions, documents et échanges ;
2. organiser ces éléments par dossier, enfant, procédure, date, thème et pièces liées ;
3. exporter un dossier clair sous forme de rapport, chronologie, tableau ou pack avocat.

---

## Positionnement produit

Parent Preuve est une application française de dossier parental conflictuel.

Elle aide un parent séparé à transformer les faits du quotidien en dossier clair, daté, structuré et exportable.

Parent Preuve n'est pas :

* une messagerie entre parents ;
* un réseau social parental ;
* un outil de conseil juridique ;
* un avocat IA ;
* un outil garantissant la recevabilité d'une preuve ;
* une application qui promet une décision favorable.

Parent Preuve est :

* un outil solo ;
* un outil factuel ;
* un outil de classement ;
* un outil de chronologie ;
* un outil d'export ;
* un assistant d'organisation documentaire.

---

## Promesse centrale

**Vous vivez les faits.
Parent Preuve les organise.**

Cette phrase doit guider la refonte UI, les textes d'accueil, les parcours utilisateurs et les futurs exports.

---

## Structure cible

La logique produit doit progressivement passer de :

* Journal ;
* Frais ;
* Documents ;
* Preuves ;
* Calendrier ;
* Courriers ;
* Exports ;
* Compte.

vers une structure plus lisible :

* Accueil ;
* Collecter ;
* Organiser ;
* Exporter ;
* Assistant IA ;
* Compte.

Les anciens modules ne doivent pas disparaître brutalement. Ils doivent être rangés progressivement dans ces trois grands espaces.

---

## Navigation cible

### Accueil

L'accueil doit expliquer en moins de 10 secondes ce que fait Parent Preuve.

Il doit mettre en avant trois grandes actions :

1. **Collecter un élément**
2. **Organiser mon dossier**
3. **Exporter mon dossier**

L'accueil doit aussi afficher :

* la prochaine action recommandée ;
* les derniers éléments ajoutés ;
* les alertes importantes ;
* les raccourcis utiles ;
* un accès clair à l'assistant IA.

---

### Collecter

L'espace **Collecter** regroupe les actions rapides.

Objectif : permettre à l'utilisateur d'ajouter un élément important en moins de 30 secondes.

Il doit permettre d'ajouter :

* un événement ;
* une preuve photo ;
* un document ;
* un frais ;
* un paiement de pension ;
* une échéance ;
* un échange ;
* une capture SMS, WhatsApp ou e-mail ;
* un incident ;
* une remise ou récupération d'enfant.

Cet espace doit être simple, rapide et rassurant. Il ne doit pas imposer un formulaire trop long dès le départ.

---

### Organiser

L'espace **Organiser** regroupe les espaces de classement.

Il doit permettre de gérer :

* les dossiers ;
* les enfants ;
* les procédures ;
* le journal ;
* le calendrier ;
* les documents ;
* les preuves ;
* les finances ;
* la chronologie ;
* les décisions de justice ;
* les obligations issues des décisions.

L'objectif est de transformer les éléments bruts en dossier structuré.

Chaque élément doit pouvoir être relié à :

* un dossier ;
* un enfant ;
* une procédure ;
* une date ;
* un thème ;
* une pièce jointe ;
* une décision ou obligation si nécessaire.

---

### Exporter

L'espace **Exporter** regroupe les sorties exploitables.

Il doit permettre de générer :

* un export PDF ;
* un courrier ;
* un rapport JAF ;
* une note avocat ;
* un bordereau de pièces ;
* un tableau des frais ;
* un tableau pension ;
* un pack avocat ;
* un export ZIP.

L'export est le résultat final visible de la valeur de Parent Preuve.

L'application ne doit pas seulement stocker. Elle doit aider à produire un dossier clair.

---

## Correspondance avec les modules existants

### Collecter

Regroupe les actions rapides actuellement dispersées :

* ajouter un événement du journal ;
* ajouter une preuve photo ;
* ajouter un document ;
* ajouter un frais ;
* ajouter une échéance calendrier ;
* ajouter une note ;
* importer un échange ;
* déclarer un incident.

---

### Organiser

Regroupe les modules de structuration :

* journal ;
* frais ;
* documents ;
* preuves ;
* calendrier ;
* dossiers ;
* procédures ;
* enfants ;
* chronologie ;
* décisions ;
* obligations.

---

### Exporter

Regroupe les modules de sortie :

* courriers ;
* exports PDF ;
* rapport ;
* pièces ;
* bordereau ;
* dossier complet ;
* pack avocat ;
* tableaux financiers.

---

## Règle technique importante

Une donnée ne doit pas être dupliquée entre Collecter, Organiser et Exporter.

Exemple :

Un frais médical de 45 € :

* **Collecter** : l'utilisateur l'ajoute rapidement ;
* **Organiser** : il le rattache à un enfant, une procédure et un justificatif ;
* **Exporter** : il apparaît dans le tableau des frais.

Le même objet métier doit être réutilisé dans plusieurs vues.

Il ne faut pas créer trois systèmes séparés. Il faut créer trois façons d'utiliser les mêmes données.

---

## Objectif UX

La refonte doit réduire l'effet "application fourre-tout".

L'utilisateur ne doit pas voir trop de modules au même niveau.

Il doit comprendre immédiatement :

* quoi ajouter ;
* où classer ;
* comment exporter.

La structure doit rester sobre, claire et mobile-first.

---

## Ordre de priorité des chantiers

### P0 — Sécurisation du travail sans Vercel

Objectif : pouvoir continuer à travailler même sans preview Vercel.

À faire :

* ajouter GitHub Actions ;
* vérifier lint, tests et build à chaque commit ;
* ne pas merger sur main tant que la CI n'est pas verte ;
* travailler par petites Pull Requests ;
* garder main stable.

---

### P1 — Accueil et navigation

Objectif : faire comprendre la promesse de Parent Preuve en moins de 10 secondes.

À faire :

* adapter l'accueil ;
* afficher trois cartes principales : Collecter, Organiser, Exporter ;
* ajouter les raccourcis vers les modules existants ;
* adapter la navigation desktop ;
* adapter la navigation mobile ;
* ne pas modifier la logique métier à cette étape.

Critère de réussite :

L'utilisateur comprend immédiatement que l'application sert à collecter, organiser et exporter un dossier parental.

---

### P2 — Pages passerelles

Créer trois pages simples :

* `/collecter`
* `/organiser`
* `/exporter`

Ces pages doivent d'abord servir de hubs vers l'existant.

Aucune refonte profonde de base de données à cette étape.

Chaque page doit présenter :

* une explication courte ;
* les actions principales ;
* des cartes de raccourcis ;
* un accès à l'assistant IA si pertinent.

---

### P3 — Collecte rapide

Créer une expérience d'ajout rapide.

Types d'éléments prioritaires :

* fait ;
* preuve ;
* document ;
* frais ;
* pension ;
* remise enfant ;
* incident ;
* échange.

Objectif :

Permettre d'ajouter un élément important en moins de 30 secondes.

L'utilisateur doit pouvoir compléter les détails plus tard dans Organiser.

---

### P4 — Chronologie intelligente

Créer ou améliorer une chronologie filtrable.

Filtres prioritaires :

* enfant ;
* procédure ;
* thème ;
* période ;
* type d'élément ;
* pièce liée.

La chronologie doit devenir le cœur du dossier.

Elle doit permettre de comprendre rapidement :

* ce qui s'est passé ;
* quand ;
* avec quelle preuve ;
* pour quel enfant ;
* dans quelle procédure.

---

### P5 — Rapport JAF / note avocat

Produire un export structuré.

Structure recommandée :

1. page de garde ;
2. résumé neutre ;
3. informations du dossier ;
4. chronologie ;
5. tableau des incidents ;
6. tableau des frais ;
7. tableau pension ;
8. liste des pièces ;
9. annexes ;
10. avertissement juridique.

Attention :

Parent Preuve ne doit jamais promettre qu'une preuve est recevable ou qu'une décision sera favorable.

Formulation recommandée :

Parent Preuve aide à produire un dossier structuré, daté, clair et exportable.

---

### P6 — Packs dossier

Préparer la monétisation des exports avancés.

Packs envisagés :

* Pack Chronologie ;
* Pack Pension / ARIPA ;
* Pack Frais ;
* Pack Dossier JAF ;
* Pack Avocat ;
* Pack Urgence audience.

Logique recommandée :

Aperçu gratuit → paiement → génération PDF/ZIP → téléchargement → conservation dans l'historique.

---

### P7 — Modules avancés

À traiter après stabilisation de la structure :

* import SMS / WhatsApp / e-mails ;
* import jugement ;
* extraction des obligations ;
* pointage remise enfant ;
* accès avocat lecture seule ;
* module ARIPA avancé ;
* demandes officielles traçables.

Ces modules sont importants, mais ils ne doivent pas être ajoutés avant que la structure Collecter / Organiser / Exporter soit claire.

---

## Garde-fous UX

Toujours privilégier :

* sobriété ;
* neutralité ;
* clarté ;
* langage factuel ;
* intérêt de l'enfant ;
* validation humaine ;
* accompagnement progressif.

Éviter :

* vocabulaire agressif ;
* promesse judiciaire ;
* termes anxiogènes ;
* surenchère de menus ;
* IA présentée comme experte juridique ;
* écrans trop chargés ;
* formulaires trop longs dès l'entrée.

---

## Garde-fous IA

L'assistant IA peut :

* aider à classer ;
* reformuler de manière neutre ;
* résumer ;
* préremplir ;
* suggérer une prochaine action documentaire ;
* aider à structurer une chronologie.

L'assistant IA ne doit pas :

* remplacer un avocat ;
* garantir la recevabilité d'une preuve ;
* promettre une issue judiciaire ;
* rédiger une stratégie juridique agressive ;
* inciter à collecter des preuves illégales ;
* affirmer qu'un document sera accepté par le juge.

---

## Garde-fous juridiques

Parent Preuve doit rester un outil d'organisation documentaire.

L'application doit éviter les promesses du type :

* "preuve garantie recevable" ;
* "dossier prêt à gagner" ;
* "validé par le JAF" ;
* "certifié juridiquement" si ce n'est pas réellement le cas ;
* "remplace un avocat".

Formulations préférées :

* "dossier structuré" ;
* "chronologie claire" ;
* "pièces organisées" ;
* "export exploitable" ;
* "à transmettre à votre avocat ou conseil" ;
* "aide à la préparation documentaire".

---

## Garde-fous techniques

Pour chaque chantier :

1. créer une branche dédiée ;
2. limiter le périmètre ;
3. ne pas casser les anciennes routes ;
4. garder les modules existants accessibles ;
5. vérifier lint, build et CI ;
6. tester desktop et mobile ;
7. éviter les duplications de données ;
8. conserver les garde-fous IA et juridiques.

---

## Méthode de développement recommandée

Pour chaque bloc :

1. lire le contexte projet ;
2. lire les fichiers concernés ;
3. modifier un périmètre limité ;
4. ajouter ou adapter les tests si possible ;
5. lancer la CI ;
6. corriger les erreurs ;
7. faire une validation visuelle ;
8. merger uniquement si tout est vert.

---

## Prochaine étape immédiate

Créer d'abord une couche de navigation et d'accueil autour de :

**Collecter / Organiser / Exporter**

Ne pas ajouter de grosses fonctionnalités tant que cette structure n'est pas posée.

La prochaine modification de code doit être limitée à :

* l'accueil ;
* la navigation ;
* la création des pages `/collecter`, `/organiser`, `/exporter` ;
* des cartes de raccourcis vers les modules existants.

Aucune modification profonde de la base de données n'est attendue à cette étape.
