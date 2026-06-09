# Vitrine Parent Preuve — Brief de conception

> Document de travail à conserver. Il rassemble toutes les décisions prises pour
> construire le **site vitrine** (site de présentation public) de Parent Preuve.
> À ressortir au moment de coder la page complète.
>
> Dernière mise à jour : 07/06/2026

---

## 1. Objectif du site

Un **site vitrine autonome** (séparé de l'application), qui présente Parent Preuve
au grand public, à la manière d'une publicité, et oriente le visiteur vers :

- l'**application web** (déjà en ligne) ;
- les **stores mobiles** (iOS / Android) — *version mobile pas encore disponible*.

Référence de **format** retenue : le site de 2houses (page longue, blocs de
fonctionnalités, ton centré sur la sérénité). On s'inspire de leur **structure**,
**pas de leur contenu** (voir § différenciation).

---

## 2. Différenciation à respecter (important)

2houses est un outil **collaboratif** : calendrier partagé entre les deux parents,
messagerie commune. **Parent Preuve est différent** : c'est un **dossier factuel
personnel**, qu'un seul parent constitue pour son propre usage.

Conséquences pour le texte du site :

- Ne **pas** promettre de calendrier partagé ni de messagerie entre ex-conjoints.
- Mettre en avant l'organisation factuelle, la traçabilité, l'export du dossier.
- Garder un ton **sobre, prudent, non accusatoire** (sujet familial sensible).

---

## 3. Décisions prises

| Sujet | Décision |
|---|---|
| Type de site | Site vitrine **séparé**, autonome |
| Volume | **Une page** longue (pages légales en pied de page) |
| Format technique | **Un seul fichier HTML/CSS** autonome (déployable sur Vercel/Netlify en projet séparé) |
| Bouton principal (CTA) | « Accéder à l'application » → `https://parent-preuve.vercel.app` |
| Badges stores | **« Bientôt disponible »** (la version mobile n'existe pas encore) — à confirmer : non cliquables OU liste d'attente e-mail |
| Identité visuelle | Reprise de l'app (voir § 4) |

**À confirmer avant de coder :** comportement exact des badges stores
(option par défaut recommandée = badges « Bientôt disponible » non cliquables).

---

## 4. Identité visuelle

Reprendre l'identité de l'application, registre **éditorial / institutionnel raffiné**
(sérieux, posé, rassurant — adapté à un sujet juridique).

**Couleurs :**

- Navy : `#15233F`
- Or : `#C2A24C` (en touches rares : filets, boutons, accents)
- Crème : `#F8F6F1`
- Texte : `#1F2733`

**Typographie :**

- Titres : **Playfair Display** (`.font-display`)
- Corps : police lisible et sobre (serif ou sans-serif de bonne facture ;
  éviter Arial/Inter/Roboto génériques)

**Principes :** beaucoup d'espace, or en touches discrètes, 1 à 2 captures d'écran
réelles de l'app comme preuve visuelle, animations légères au chargement seulement.

---

## 5. Contraintes de rédaction (règles juridiques absolues)

### Interdit / à éviter dans tous les textes

- « preuve certifiée », « preuve incontestable », « recevable en justice »
- « garanti », « certifié conforme », « inviolable »
- « constat d'huissier » / « constat de commissaire de justice »
  (sauf pour dire que l'app **ne le remplace pas**)
- « remplace un avocat », promesse d'issue judiciaire
- accusations / qualifications : « abandon de famille », « manipulation »,
  « mauvaise foi », « pervers narcissique », « parent dangereux »

### Recommandé

- « aide à organiser votre dossier »
- « aide à la rédaction factuelle »
- « preuve numérique renforcée », « horodatée », « scellée »
- « traçabilité renforcée »
- « soumis à l'appréciation du juge »
- « l'IA propose, vous validez »
- « ne remplace pas un conseil juridique »
- « ne remplace pas un constat de commissaire de justice »
- « à faire relire par un professionnel du droit si nécessaire »

---

## 6. Structure de la page (bloc par bloc)

### Bloc 1 — En-tête
- Nom « Parent Preuve » (+ logo si disponible).
- Bouton unique : **« Accéder à l'application »**.

### Bloc 2 — Hero
- Accroche (voir pistes ci-dessous).
- Sous-titre explicatif.
- Bouton principal + badges stores (« bientôt »).
- Visuel : capture de l'app ou illustration sobre.

**Accroche (à choisir) :**
- « Votre coparentalité, organisée et documentée. »
- « Gardez le fil. Réunissez les faits. Avancez sereinement. »
- « Organisez sereinement votre dossier après le JAF. »

**Sous-titre (proposition) :**
> Parent Preuve vous aide à réunir, dater et organiser les éléments factuels de
> votre coparentalité — journal, frais, pension, pièces — et à les exporter en un
> dossier clair, prêt à présenter.

### Bloc 3 — Le quotidien que ça simplifie
Court paragraphe empathique, sans dramatiser. Idée : après une décision du JAF,
suivre les paiements, garder une trace des événements et retrouver ses pièces
devient vite épuisant ; Parent Preuve remet de l'ordre.

### Bloc 4 — Comment ça marche (3 étapes)
1. **Organiser** — enfants, journal, frais, pension, documents au même endroit.
2. **Documenter** — preuves photo horodatées et scellées, pièces rattachées.
3. **Exporter** — un dossier PDF factuel, clair, prêt à transmettre.

### Bloc 5 — Fonctionnalités (cartes)

> Textes factuels, sans promesse de résultat.

- **Journal d'événements** — Notez les faits datés au fil de l'eau ; chaque entrée
  peut être validée puis intégrée au dossier.
- **Frais & pension** — Suivez les montants dus et payés, visualisez le reste dû,
  rattachez les justificatifs.
- **Preuves photo renforcées** — Photo horodatée et scellée (conservation de
  l'original, empreinte numérique, métadonnées disponibles). *Ne remplace pas un
  constat de commissaire de justice.*
- **Assistant courriers** — Modèles de courriers factuels ; les articles de loi
  sont saisis et vérifiés par vous, jamais générés automatiquement.
- **Analyse assistée du jugement** — L'IA propose une lecture des règles du
  jugement à partir du texte fourni ; **vous vérifiez et validez** chaque élément
  avant tout enregistrement.

### Bloc 6 — Vos données, votre maîtrise
- Données hébergées en **Europe**.
- Conforme à une logique **RGPD** (effacement de vos données possible).
- **« L'IA propose, vous validez »** : aucun enregistrement sans votre validation.
- Limites assumées : **ne remplace pas un conseil juridique ni un constat**.

**Bandeau confiance (proposition) :**
> Vos données sont hébergées en Europe. L'IA vous propose des analyses à partir des
> documents que vous fournissez ; vous vérifiez et validez chaque information.
> L'application ne remplace pas un conseil juridique ni un constat de commissaire
> de justice.

### Bloc 7 — Accès
- Rappel du bouton **« Accéder à l'application »** (web).
- Badges **App Store** et **Google Play** en mode « Bientôt disponible ».

### Bloc 8 — Pied de page
- Liens : **Mentions légales**, **Politique de confidentialité**, **Contact**.
- Mention courte : édité par [nom], hébergé en Europe.
- *À rédiger / publier séparément (chantier RGPD en cours).*

---

## 7. Gestion des liens stores

La version mobile **n'existe pas encore** (feuille de route : React Native/Expo ou PWA).

- Option par défaut : badges **« Bientôt disponible »** non cliquables.
- Option alternative : badges menant à une **liste d'attente e-mail**.
- Quand l'app mobile sortira : remplacer par les vraies URL App Store / Google Play.

Bouton web (actif dès maintenant) : `https://parent-preuve.vercel.app`

---

## 8. Responsive / mobile

- Plus de 60 % du trafic est mobile : concevoir **mobile d'abord**.
- Le bouton principal doit rester **visible tôt** sur petit écran.
- Boutons empilés, cartes en pleine largeur sur mobile.
- Textes d'avertissement courts mais lisibles.

---

## 9. Bonnes pratiques de page (rappel)

- **Un seul objectif clair** : accéder à l'application.
- Un **bouton principal** dominant ; les badges stores ne doivent pas lui faire
  concurrence visuellement.
- Accroche courte (idéalement < 8 mots).
- Chaque section doit « mériter » le scroll suivant — pas de remplissage.
- La preuve (capture d'écran, réassurance données) proche des affirmations.

---

## 10. Questions ouvertes à trancher

- [ ] Comportement final des badges stores (non cliquables vs liste d'attente).
- [ ] Choix de l'accroche hero parmi les pistes.
- [ ] Capture(s) d'écran réelle(s) de l'app à intégrer (à fournir).
- [ ] Logo disponible ? sinon titre typographique seul.
- [ ] Nom/coordonnées à afficher dans le pied de page (cohérent avec mentions légales).
- [ ] Adresse e-mail de contact.

---

## 11. Pour coder plus tard

Quand tu seras prêt : rouvre ce fichier, confirme les cases du § 10, et demande
la **page vitrine complète en un seul fichier HTML/CSS**. Le code reprendra les
couleurs et la typographie du § 4 et les textes des § 6.
