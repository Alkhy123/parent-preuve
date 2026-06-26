# Rapport d'audit visuel — preview Vercel

Audit automatisé de la preview déployée, via capture Playwright (chromium), avec
connexion par le compte de test (identifiants chargés depuis `.env.local`, jamais
écrits ici). Capture : 9 pages × 3 thèmes × 2 viewports = **54/54 captures réussies**.

- Script : `scripts/audit-visuel-preview.mjs` (autonome, lecture seule, aucune
  écriture en base / aucune modif métier). Relance : `node scripts/audit-visuel-preview.mjs`.
- Captures : `docs/audit-visuel-preview/screenshots/<theme>/<viewport>/<page>.png`.
- Thèmes : `classique-bleu`, `ivoire-greffe`, `noir-or-sombre` (data-theme vérifié
  appliqué sur chaque page).
- Viewports : desktop 1440×900, mobile 390×844.
- Méthode : **les 54 captures ont été générées** ; un sous-ensemble représentatif
  (~12) a été **inspecté visuellement** pour cet audit (indiqué ci-dessous). Le
  reste est disponible pour revue.

## 1. Pages testées

| Page | classique-bleu | ivoire-greffe | noir-or-sombre |
|---|---|---|---|
| `/` (tableau de bord) | desktop+mobile | desktop+mobile | desktop+mobile |
| `/journal` | idem | idem | idem |
| `/frais` | idem | idem | idem |
| `/documents` | idem | idem | idem |
| `/preuves` | idem | idem | idem |
| `/preuves/nouvelle` | idem | idem | idem |
| `/calendrier` | idem | idem | idem |
| `/calendrier/avance` | idem | idem | idem |
| `/compte` | idem | idem | idem |

Inspectées visuellement dans ce rapport : `/` (classique/ivoire/sombre desktop + sombre mobile),
`/journal` (classique desktop + classique mobile), `/frais` (classique desktop + sombre mobile),
`/documents` (classique desktop), `/calendrier` (classique desktop + sombre mobile).

## 2. Chemins des captures

```
docs/audit-visuel-preview/screenshots/
  classique-bleu/{desktop,mobile}/{accueil,journal,frais,documents,preuves,preuves-nouvelle,calendrier,calendrier-avance,compte}.png
  ivoire-greffe/{desktop,mobile}/...(idem)
  noir-or-sombre/{desktop,mobile}/...(idem)
```

## 3. Problèmes visuels détectés

| # | Sévérité | Page / zone | Problème |
|---|---|---|---|
| V1 | **Élevée** | `/frais` mobile (visible surtout en thème sombre) | **Débordement horizontal** : une bande au fond crème apparaît à droite, l'app-shell ne couvre pas toute la largeur → un élément dépasse 390 px (probablement le formulaire partagé `RegleFrais` ou un champ non contraint). |
| V2 | **Élevée** | Global (tous thèmes) | Le `<body>` garde un **fond crème non thémé** (`--background: #ECE7DC`). Invisible quand l'app-shell couvre tout, mais **criant en thème sombre** dès qu'il y a un débordement ou un gap (cf. V1). |
| V3 | Moyenne | Topbar AppShell (toutes pages migrées) | **Accents manquants** : « Donnees reelles de votre dossier, filtrees par les pages metier. » → devrait être « Données réelles… filtrées… métier ». |
| V4 | Faible | `/documents` (cartes document) | Les cartes document n'ont **pas d'icône de tête** (l'aperçu `/apercu/documents` en a une) → rendu un peu plus plat. |
| V5 | Faible | `/frais` desktop | Le formulaire partagé `RegleFrais` s'affiche déplié au milieu de la page et pousse la liste des frais vers le bas (densité « formulaire » plus marquée que l'aperçu). |

Points **positifs** confirmés (conformes aux aperçus) :
- Tableau de bord : hero « Prochaine étape recommandée » teinté + badge priorité, cartes
  à icônes, barre « Dossier complété 3/4 · 75 % » (donnée réelle), saisie rapide illustrée,
  copilote contextuel.
- Journal : pleine largeur, tuile date colorée, badges catégorie/statut, « Sans pièce
  associée » en ambre, actions discrètes, copilote « Adapté à : Journal ».
- Documents / Calendrier : structure conforme (filtres, groupes, règle de garde +
  aperçu week-ends + calendrier mensuel).

## 4. Écarts entre pages réelles et maquettes `/apercu`

- **Globalement faibles** : les vraies pages appartiennent visuellement au même
  design system que `/apercu/*` (shell, cartes, filtres en pastilles, copilote, thèmes).
- `/frais` réel intègre le formulaire **`RegleFrais`** (métier réel) absent de
  l'aperçu → page plus dense (attendu, ne pas supprimer la fonctionnalité).
- `/calendrier` réel repose sur la **règle de garde** (métier réel) et non sur une
  liste d'échéances comme l'aperçu (divergence assumée et documentée).
- `/documents` : icône de carte manquante vs aperçu (V4).

## 5. Problèmes responsive

- **`/frais` mobile : scroll horizontal / débordement** (V1) — à corriger en
  priorité (contraindre `RegleFrais` et les champs à `max-w-full`, `min-w-0`,
  `overflow-x-auto` localisé).
- Autres pages mobiles inspectées (**`/`, `/journal`, `/calendrier` en sombre**) :
  **propres**, une seule colonne, nav basse présente, copilote en bouton (non
  permanent), pas de scroll horizontal.
- À vérifier (capturé mais non inspecté en détail) : `/preuves`, `/preuves/nouvelle`,
  `/documents`, `/calendrier/avance`, `/compte` en mobile sur les 3 thèmes (mêmes
  patterns ; risque de débordement surtout là où des formulaires partagés sont denses).

## 6. Problèmes de thème

- **`classique-bleu`** : conforme, lisible (référence).
- **`ivoire-greffe`** : après retune, les **cartes se détachent bien du fond** ivoire ;
  ambiance « greffe » respectée ; pas de beige uniforme problématique sur les pages
  inspectées.
- **`noir-or-sombre`** : **lisible et premium** (texte clair, cartes gris foncé
  distinctes du fond, accents or, hero or adouci). **Réserve** : le fond `<body>`
  crème (V2) casse l'effet sombre dès qu'un débordement le révèle (cf. `/frais`).

## 7. Priorité des corrections

1. **P1 — `/frais` mobile : supprimer le débordement horizontal** (V1). Cause
   probable : `RegleFrais` (composant partagé) ou un champ large non contraint.
2. **P1 — Fond `<body>` thémé** (V2) : faire suivre le fond global au thème (ou
   garantir que l'app-shell couvre toujours toute la largeur/hauteur) pour éviter la
   bande crème en thème sombre.
3. **P2 — Accents topbar AppShell** (V3) : corriger la chaîne « Données réelles…
   filtrées… métier » dans `components/app/AppShell.tsx`.
4. **P3 — Icône de carte sur `/documents`** (V4) pour s'aligner sur l'aperçu.
5. **P3 — Densité `/frais`** (V5) : envisager de replier `RegleFrais` par défaut.
6. **Vérification complémentaire** : inspecter les captures mobiles non encore
   revues (preuves, preuves/nouvelle, documents, calendrier/avance, compte) pour
   confirmer l'absence d'autres débordements.

---

### Notes techniques (hors livrable visuel)
- `@playwright/test` a été installé **localement sans enregistrement** (`--no-save`,
  contournement SSL `--use-system-ca`) uniquement pour la capture ; non commité,
  non ajouté à `package.json`.
- Aucune modification de fichier métier, route IA, migration ou donnée. Rien n'a été
  commité. Identifiants de test non divulgués.
