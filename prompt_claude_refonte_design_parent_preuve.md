# Prompt Claude / Cursor — Refonte esthétique de la vitrine Parent Preuve

## Contexte du projet

Je développe une application appelée **Parent Preuve**, destinée aux parents confrontés à des situations de coparentalité conflictuelle ou à un suivi post-décision JAF.

L’application permet notamment de :

- tenir un journal chronologique des événements ;
- suivre les frais partagés et les pensions ;
- organiser les justificatifs et pièces ;
- ajouter des photos avec traçabilité numérique renforcée ;
- préparer des courriers avec une aide IA ;
- exporter un dossier PDF clair, daté et structuré ;
- aider l’utilisateur à mieux préparer un dossier factuel pour un avocat, un médiateur ou une audience.

Le site vitrine actuel est disponible à cette adresse :

https://parent-preuve.vercel.app/vitrine

Je souhaite améliorer principalement **le design, l’esthétique, la clarté visuelle et la conversion**, sans modifier l’esprit sérieux et prudent de l’application.

---

## Objectif global

Refondre la page vitrine pour qu’elle soit :

- plus premium ;
- plus chaleureuse ;
- plus rassurante ;
- plus mémorable visuellement ;
- plus claire pour un parent non technicien ;
- plus crédible dans un contexte juridique ;
- moins froide qu’un SaaS classique ;
- mieux orientée conversion.

L’objectif n’est pas de faire une page agressive de vente, mais une vitrine professionnelle, sobre, humaine et rassurante.

La page doit inspirer :

- confiance ;
- calme ;
- rigueur ;
- organisation ;
- sécurité ;
- sérieux juridique ;
- accompagnement humain.

---

## Contraintes importantes

### 1. Ne pas faire de promesse juridique excessive

L’application ne doit jamais promettre que :

- les preuves seront automatiquement recevables ;
- les photos remplaceront un constat de commissaire de justice ;
- le PDF sera forcément accepté par un juge ;
- l’IA donnera un conseil juridique ;
- l’application remplace un avocat.

Il faut conserver une formulation prudente.

À privilégier :

- “renforcer la traçabilité” ;
- “structurer les éléments” ;
- “préparer un dossier plus lisible” ;
- “aider à organiser les faits” ;
- “soumis à l’appréciation du juge” ;
- “ne remplace pas un avocat ni un commissaire de justice”.

À éviter :

- “preuve garantie” ;
- “preuve certifiée juridiquement” ;
- “valable devant le juge” ;
- “équivalent huissier” ;
- “dossier accepté par le tribunal” ;
- “preuve incontestable”.

---

## Direction artistique souhaitée

### Style général

Je souhaite un style :

- sérieux ;
- moderne ;
- doux ;
- premium ;
- rassurant ;
- sobre ;
- clair ;
- légèrement institutionnel, mais pas froid.

Le design doit parler à des parents souvent stressés, fatigués ou perdus dans un contexte familial et juridique difficile.

Il faut éviter :

- le style trop start-up flashy ;
- le style trop juridique agressif ;
- les icônes clichées type marteau de juge ou balance partout ;
- les couleurs trop dures ;
- les écrans surchargés ;
- les promesses trop commerciales.

---

## Palette de couleurs recommandée

Tu peux proposer une palette dans cet esprit :

```css
--color-navy: #1F2937;
--color-slate: #334155;
--color-cream: #F8F5EF;
--color-soft-white: #FFFCF7;
--color-sage: #4F7C73;
--color-sage-light: #DDEBE7;
--color-amber: #D99A3D;
--color-muted: #6B7280;
--color-border: #E5E1D8;
```

### Intention des couleurs

- **Bleu nuit / ardoise** : sérieux, stabilité, confiance.
- **Crème / blanc cassé** : chaleur humaine, douceur, apaisement.
- **Vert sauge** : calme, sécurité, équilibre.
- **Ambre doux** : attention, repères, éléments importants sans agressivité.
- **Gris doux** : lisibilité, sobriété.

Le fond général ne doit pas forcément être blanc pur. Un fond crème très léger peut rendre le site plus humain et plus premium.

---

## Typographie

Objectif : lisibilité + sérieux + modernité.

Suggestions :

- titres : police moderne, élégante et solide ;
- texte : police très lisible ;
- éviter les polices trop fantaisie.

Exemples possibles :

- `Inter`;
- `Manrope`;
- `Source Sans 3`;
- `DM Sans`;
- `IBM Plex Sans`.

Les titres doivent avoir du poids, mais rester sobres.

---

## Logo et identité visuelle

Le logo actuel “PP Parent Preuve” fonctionne, mais il peut être amélioré pour être plus mémorable.

Je souhaite explorer une identité autour de :

- une ligne de temps ;
- des points reliés ;
- un dossier structuré ;
- une empreinte numérique ;
- un bouclier discret ;
- une trace fiable ;
- un fil conducteur.

Éviter les symboles trop juridiques comme :

- marteau de juge ;
- balance omniprésente ;
- palais de justice trop institutionnel.

Le logo doit évoquer :

- la chronologie ;
- l’organisation ;
- la preuve ;
- la sécurité ;
- la sérénité.

---

## Hero section à améliorer

La section d’accueil actuelle a un bon message :

> Gardez le fil. Réunissez les faits. Avancez sereinement.

Cette phrase peut être conservée.

### Objectif de la nouvelle hero section

Créer un haut de page plus impactant, avec :

- un grand titre clair ;
- un sous-titre rassurant ;
- deux boutons d’action ;
- une grande maquette visuelle de l’application ;
- des éléments de réassurance.

### Proposition de structure

À gauche :

```text
Gardez le fil.
Réunissez les faits.
Avancez sereinement.
```

Sous-titre :

```text
Parent Preuve vous aide à organiser les événements, frais, pensions, justificatifs et éléments photo dans un dossier clair, daté et structuré.
```

Bouton principal :

```text
Créer mon dossier
```

Bouton secondaire :

```text
Voir un exemple de dossier PDF
```

Petits éléments de réassurance sous les boutons :

```text
Version web disponible
Données hébergées en Europe
Export PDF structuré
```

À droite :

Créer une grande maquette d’interface dans un cadre de navigateur ou de téléphone.

Elle peut afficher :

- une carte “Journal d’événements” ;
- une carte “Frais & pension” ;
- une carte “Preuves photo” ;
- une carte “Export PDF” ;
- une mini timeline ;
- une indication du type “3 éléments prêts à exporter”.

---

## Maquettes visuelles à créer

La vitrine doit montrer concrètement ce que l’utilisateur obtient.

### 1. Maquette tableau de bord

Créer une maquette avec :

- “Journal” ;
- “Frais & pensions” ;
- “Pièces” ;
- “Photos renforcées” ;
- “Export PDF”.

Exemple visuel :

```text
Dossier Y.
12 événements
4 frais suivis
8 pièces ajoutées
2 photos renforcées
Export PDF prêt
```

### 2. Maquette timeline

Créer une section avec une timeline verticale.

Exemple :

```text
14 mai — Pension partielle reçue
16 mai — Relance envoyée
20 mai — Justificatif ajouté
25 mai — Élément validé pour export PDF
```

L’objectif est que l’utilisateur comprenne immédiatement que l’application l’aide à reconstituer une chronologie.

### 3. Maquette dossier PDF

Ajouter une section très importante : **exemple de dossier PDF généré**.

Créer une fausse page PDF visuelle, avec :

```text
DOSSIER FACTUEL — Parent Preuve

1. Chronologie des événements
2. Frais et pensions
3. Pièces justificatives
4. Éléments photo
5. Annexes
6. Avertissement juridique
```

Cette section doit être très visible, car l’export PDF est probablement un des meilleurs arguments de conversion.

Bouton associé :

```text
Voir un exemple de dossier PDF
```

---

## Structure de page recommandée

La nouvelle page vitrine pourrait suivre cette structure :

1. Header clair et sobre
2. Hero section premium avec mockup
3. Bande de réassurance
4. Section “Pourquoi Parent Preuve ?”
5. Section “En 3 étapes”
6. Section timeline / chronologie
7. Section fonctionnalités principales
8. Section exemple de dossier PDF
9. Section preuve photo renforcée
10. Section assistant courrier / IA prudente
11. Section sécurité et confidentialité
12. Section “Ce que Parent Preuve ne fait pas”
13. FAQ courte
14. CTA final

---

## Header

Le header doit rester simple.

Éléments possibles :

- logo Parent Preuve ;
- lien Fonctionnalités ;
- lien Sécurité ;
- lien FAQ ;
- bouton “Accéder à l’application”.

Le bouton principal peut être renommé :

```text
Créer mon dossier
```

ou :

```text
Tester la version web
```

Éviter de mettre trop en avant “Bientôt App Store / Google Play” dans le header. Cela peut donner l’impression que le produit n’est pas encore prêt.

---

## Bande de réassurance

Ajouter sous la hero une bande sobre avec 3 ou 4 éléments :

```text
Dossier exportable en PDF
Données organisées par enfant
Traçabilité photo renforcée
Conçu pour rester factuel
```

Design :

- petites icônes simples ;
- fond légèrement teinté ;
- texte court ;
- beaucoup de respiration.

---

## Section “Pourquoi Parent Preuve ?”

Créer une section plus émotionnelle mais toujours sobre.

Texte possible :

```text
Quand les échanges deviennent confus, les justificatifs se dispersent et les faits s’accumulent, il devient difficile de présenter une situation claire.

Parent Preuve vous aide à reprendre le fil : dater les événements, classer les justificatifs, suivre les frais et préparer un dossier lisible.
```

Objectif : parler au vécu du parent sans dramatiser.

---

## Section “En 3 étapes”

Conserver l’idée actuelle, mais améliorer visuellement.

### Étape 1 — Organiser

```text
Créez un dossier par enfant et centralisez les informations essentielles.
```

### Étape 2 — Documenter

```text
Ajoutez les événements, frais, pensions, justificatifs et éléments photo.
```

### Étape 3 — Exporter

```text
Générez un dossier PDF clair, daté et structuré, prêt à être relu, transmis ou présenté selon les besoins.
```

Design :

- 3 cartes larges ;
- icônes sobres ;
- numéros visibles ;
- léger effet de profondeur ;
- fond crème ou blanc cassé.

---

## Section fonctionnalités principales

Créer des cartes visuellement équilibrées.

Fonctionnalités à afficher :

### Journal d’événements

```text
Notez les faits importants dans une chronologie claire, avec date, catégorie et pièces liées.
```

### Frais & pensions

```text
Suivez les dépenses partagées, remboursements, pensions et justificatifs associés.
```

### Pièces justificatives

```text
Centralisez les documents utiles dans un espace structuré.
```

### Photos renforcées

```text
Conservez l’original, les métadonnées disponibles, une empreinte SHA-256 et un horodatage.
```

### Assistant courrier

```text
Préparez des courriers plus clairs à partir de vos éléments, sans remplacer un conseil juridique.
```

### Export PDF

```text
Générez un dossier synthétique avec chronologie, pièces, frais, photos et avertissements.
```

---

## Section preuve photo renforcée

Important : remplacer ou nuancer les formulations trop fortes comme “preuve scellée”.

À privilégier :

```text
Photo numérique renforcée
```

ou :

```text
Traçabilité photo renforcée
```

Texte possible :

```text
Parent Preuve peut conserver l’image originale, certaines métadonnées techniques, une empreinte SHA-256 et un horodatage afin de renforcer la traçabilité de l’élément photo.

Ces éléments ne remplacent pas un constat de commissaire de justice et restent soumis à l’appréciation des professionnels du droit et du juge.
```

Éléments visuels possibles :

- carte “Original conservé” ;
- carte “Empreinte SHA-256” ;
- carte “Horodatage” ;
- carte “Métadonnées disponibles”.

---

## Section IA / assistant courrier

L’IA ne doit pas être présentée comme un avocat.

Texte possible :

```text
L’assistant peut aider à reformuler un courrier, clarifier une chronologie ou structurer une demande à partir des éléments saisis.

Il ne remplace pas un avocat, ne fournit pas de conseil juridique personnalisé et ne prend aucune décision à la place de l’utilisateur.
```

Design :

- bloc calme ;
- icône plume ou document ;
- avertissement discret mais visible.

---

## Section sécurité / confidentialité

Créer une section design avec des cartes :

### Données organisées

```text
Chaque dossier est structuré autour des informations saisies par l’utilisateur.
```

### Suppression possible

```text
L’utilisateur doit pouvoir supprimer ses éléments et son compte selon les règles prévues.
```

### Hébergement européen

```text
Mettre en avant l’hébergement européen uniquement si c’est techniquement exact.
```

### Minimisation

```text
L’application doit encourager à ne saisir que les informations nécessaires.
```

Attention : ne pas écrire de promesses RGPD trop vagues.

Remplacer :

```text
Conforme à une logique RGPD
```

par :

```text
Conçu selon les principes du RGPD : minimisation, transparence et contrôle utilisateur.
```

ou :

```text
Pensé pour limiter les données saisies et laisser l’utilisateur garder le contrôle.
```

---

## Section données de santé

Point de vigilance important.

Dans une application de coparentalité, les utilisateurs risquent d’ajouter des factures médicales, frais d’ostéopathie, pharmacie, orthophonie, psychologue, etc.

Il faut intégrer un message prudent.

Texte possible :

```text
Parent Preuve peut vous aider à suivre un frais de santé sur le plan financier, mais l’application n’est pas destinée à stocker des diagnostics, ordonnances détaillées, comptes rendus médicaux ou informations sensibles inutiles.

Avant d’ajouter un justificatif, pensez à masquer les informations médicales non nécessaires.
```

Ajouter cette prudence soit :

- dans la section confidentialité ;
- dans la FAQ ;
- dans l’application au moment de l’upload.

---

## Section “Ce que Parent Preuve ne fait pas”

Créer une section très rassurante, sous forme de deux colonnes.

### Parent Preuve ne remplace pas

- un avocat ;
- un commissaire de justice ;
- une décision de justice ;
- une consultation juridique personnalisée ;
- l’appréciation du juge.

### Parent Preuve aide à

- classer les faits ;
- dater les événements ;
- centraliser les justificatifs ;
- préparer une chronologie ;
- exporter un dossier lisible ;
- réduire les oublis.

Cette section doit être visuellement claire, pas anxiogène.

---

## FAQ à ajouter

Créer une FAQ courte avec ces questions.

### Parent Preuve remplace-t-il un avocat ?

```text
Non. Parent Preuve aide à organiser les faits et les documents, mais ne remplace pas un avocat ni un conseil juridique personnalisé.
```

### Une photo ajoutée dans Parent Preuve vaut-elle constat de commissaire de justice ?

```text
Non. L’application peut renforcer la traçabilité numérique d’une photo, mais ne remplace pas un constat de commissaire de justice.
```

### Puis-je exporter mon dossier ?

```text
Oui. L’application permet de générer un dossier PDF structuré regroupant les éléments saisis.
```

### Mes données sont-elles utilisées pour entraîner une IA ?

```text
À préciser selon la configuration technique exacte. Si ce n’est pas le cas, l’indiquer clairement.
```

### Puis-je supprimer mes données ?

```text
Oui, l’utilisateur doit pouvoir supprimer ses données selon les modalités prévues dans la politique de confidentialité.
```

### Puis-je utiliser Parent Preuve même sans procédure en cours ?

```text
Oui. L’application peut servir à garder une trace factuelle et organisée, même avant toute démarche.
```

---

## CTA final

Créer une section finale sobre, rassurante et orientée action.

Titre possible :

```text
Reprenez le fil de votre dossier.
```

Sous-titre :

```text
Centralisez vos événements, frais, justificatifs et éléments photo dans un espace clair et structuré.
```

Bouton principal :

```text
Créer mon dossier
```

Bouton secondaire :

```text
Voir un exemple de dossier PDF
```

---

## Recommandations UI détaillées

### Espacement

Augmenter la respiration entre les grandes sections.

Le site doit donner une sensation :

- d’ordre ;
- de clarté ;
- de calme ;
- de maîtrise.

Éviter les blocs trop serrés.

### Cartes

Les cartes doivent avoir :

- coins arrondis ;
- bordures très légères ;
- ombre douce ;
- fond blanc cassé ou blanc ;
- icône simple ;
- titre court ;
- texte court.

### Boutons

Bouton principal :

- couleur vert sauge ou bleu nuit ;
- texte blanc ;
- arrondi confortable ;
- état hover visible.

Bouton secondaire :

- fond transparent ou crème ;
- bordure fine ;
- texte bleu nuit.

### Icônes

Utiliser des icônes sobres :

- document ;
- ligne de temps ;
- cadenas ;
- appareil photo ;
- dossier ;
- plume ;
- fichier PDF ;
- empreinte numérique.

Éviter les icônes trop émotionnelles ou trop agressives.

### Animations

Animations légères possibles :

- apparition douce au scroll ;
- hover très discret sur les cartes ;
- légère élévation des mockups.

Ne pas surcharger avec des animations trop voyantes.

---

## Pages liées à vérifier

En plus de la vitrine, vérifier visuellement :

- page de confidentialité ;
- mentions légales ;
- conditions générales ;
- page de connexion ;
- page d’inscription ;
- responsive mobile.

Les mentions légales et la politique de confidentialité contiennent peut-être encore des champs à compléter. Ne pas les laisser en production avec des crochets du type `[Nom]`, `[Adresse]`, `[Email]`, etc.

---

## Responsive mobile

La vitrine doit être excellente sur mobile.

Points à vérifier :

- hero lisible ;
- boutons bien espacés ;
- mockup pas trop grand ;
- cartes empilées proprement ;
- FAQ facile à lire ;
- header simplifié ;
- pas de textes trop longs en largeur mobile.

Sur mobile, le CTA principal doit rester visible rapidement.

---

## Accessibilité

Vérifier :

- contraste suffisant ;
- textes lisibles ;
- tailles de police confortables ;
- boutons accessibles ;
- focus visible au clavier ;
- attributs alt sur les images ;
- titres hiérarchisés correctement ;
- pas de texte trop clair sur fond clair.

---

## Formulations à remplacer

### Remplacer

```text
Dossier PDF prêt à présenter
```

par :

```text
Dossier PDF clair, daté et structuré, prêt à être relu, transmis ou présenté selon les besoins.
```

### Remplacer

```text
Preuve scellée horodatée
```

par :

```text
Photo numérique renforcée
```

ou :

```text
Traçabilité photo renforcée
```

### Remplacer

```text
Conforme à une logique RGPD
```

par :

```text
Conçu selon les principes du RGPD : minimisation, transparence et contrôle utilisateur.
```

ou :

```text
Pensé pour limiter les données saisies et laisser l’utilisateur garder le contrôle.
```

### Remplacer

```text
Accéder à l’application
```

par un CTA plus engageant selon le contexte :

```text
Créer mon dossier
```

ou :

```text
Tester la version web
```

ou :

```text
Organiser mon dossier
```

---

## Ton rédactionnel

Le ton doit être :

- clair ;
- calme ;
- factuel ;
- rassurant ;
- humain ;
- non agressif ;
- juridiquement prudent.

Éviter :

- les superlatifs excessifs ;
- les promesses absolues ;
- les phrases anxiogènes ;
- les formulations trop commerciales.

Exemple de ton souhaité :

```text
Parent Preuve vous aide à reprendre le fil de vos éléments : événements, frais, justificatifs et photos sont organisés dans un dossier clair et exportable.
```

---

## Checklist finale de validation

Avant de considérer la refonte terminée, vérifier :

- [ ] La hero section est plus forte visuellement.
- [ ] Le site paraît plus premium et plus humain.
- [ ] La palette est cohérente sur toute la page.
- [ ] Les CTA sont plus engageants.
- [ ] Un exemple de dossier PDF est visible.
- [ ] Une timeline rend le concept concret.
- [ ] Les sections respirent davantage.
- [ ] Les avertissements juridiques sont visibles mais non anxiogènes.
- [ ] Aucune promesse juridique excessive n’est faite.
- [ ] Les mentions RGPD sont prudentes.
- [ ] Les données de santé sont traitées avec vigilance.
- [ ] Le site est parfaitement responsive.
- [ ] Le design mobile est propre.
- [ ] Les textes sont lisibles.
- [ ] Les pages légales ne contiennent plus de champs à compléter.
- [ ] L’ensemble donne confiance à un parent en situation de stress ou de conflit.

---

## Demande finale à Claude

À partir de ces consignes, améliore la vitrine Parent Preuve en priorité sur :

1. l’identité visuelle ;
2. la palette ;
3. la hero section ;
4. les mockups ;
5. la timeline ;
6. la section exemple de PDF ;
7. les CTA ;
8. les avertissements juridiques prudents ;
9. le responsive mobile ;
10. l’impression globale de sérieux, de calme et de confiance.

Ne modifie pas le cœur fonctionnel de l’application sauf si nécessaire pour l’affichage de la vitrine.

Ne supprime pas les avertissements juridiques existants : améliore-les, rends-les plus lisibles et mieux intégrés au design.
