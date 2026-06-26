# Audit UI — aperçus de design Parent Preuve (`/apercu/*`)

Auto-audit de la passe de finition UX des routes d'aperçu. Ces pages sont des
**prototypes visuels** : données fictives, aucune logique métier / Supabase / IA.

## Légende des statuts

- **OK** : vérifié (revue de code + build).
- **OK (code)** : conformité vérifiée par revue de code et classes responsive ;
  rendu non inspecté pixel par pixel dans un navigateur.
- **À vérifier** : à contrôler visuellement.

## Critères transverses (communs, via `components/apercu/AppShell.tsx`)

- Sidebar gauche `w-60` (logo, procédure active, navigation, encart RGPD).
- Topbar (recherche, copilote mobile, notifications, profil, « Quitter l'aperçu »).
- Colonne copilote droite `w-80` (desktop `xl+`) / feuille latérale (< `xl`).
- Bouton flottant « + » : `lg:hidden` → **masqué sur desktop**, visible mobile/tablette.
- Bandeau « Aperçu de design » : affiché **uniquement** si `usePathname()` commence
  par `/apercu` → jamais en production.
- Typographie d'interface sans-serif (override scopé `.apercu-shell` dans
  `globals.css`), titres `font-semibold tracking-tight text-slate-900`.
- Copilote toujours contextuel : module actif + 3 suggestions + 1 conseil +
  bouton « Poser une question » + disclaimer prudent.

## Tableau d'audit

| Page | Visuel | Actions | Copilote | Mobile | Bouton + desktop | Remarques |
|---|---|---|---|---|---|---|
| Tableau de bord | OK | OK | OK (Tableau de bord) | OK (code) | Masqué | Prochaine action dominante ; liens pension/dossier/onboarding → routes réelles (pas d'aperçu dédié) |
| Journal / Événements | OK | OK | OK (Journal) | OK (code) | Masqué | Filtres + période + export + « afficher plus » + résumé du mois ; par événement : pièce associée/sans pièce + actions Voir/Associer |
| Frais | OK | OK | OK (Frais) | OK (code) | Masqué | 4 cartes résumé ; filtres statut + catégorie ; statut/justificatif/enfant/montant par dépense |
| Documents | OK | OK | OK (Documents) | OK (code) | Masqué | Recherche + catégories ; statut classé/à classer ; actions Voir/Renommer/Associer |
| Preuves | OK | OK | OK (Preuves) | OK (code) | Masqué | Vocabulaire prudent (empreinte présente / horodatage enregistré) ; encart de prudence ; « Associer au journal » |
| Calendrier | OK | OK | OK (Calendrier) | OK (code) | Masqué | Vue liste active + « Vue mois » marquée Bientôt ; filtres par type ; statut à venir/à préparer/terminé |
| Procédures | OK | OK | OK (Procédures) | OK (code) | Masqué | Enfants, autre parent, complétion, dernière activité, statut ; actions Ouvrir/Configurer/Exporter |
| Autres parents | OK | OK | OK (Autres parents) | OK (code) | Masqué | Coordonnées dispo/manquantes ; procédure liée ; statut ; cadrage anti carnet d'adresses |
| Synthèses & exports | OK | OK | OK (Synthèses & exports) | OK (code) | Masqué | Stepper 4 étapes ; options sélectionnables + compteur ; avertissement prudent |

> `Modèles` et `Paramètres` : pas de page d'aperçu (hors périmètre des 7 modules
> demandés) ; items de navigation non navigables.

## Vérifications juridiques (ton prudent)

- Preuves : aucune mention « vérifiée / certifiée / recevable / irréfutable ».
- Synthèses : avertissement « ne remplace pas une relecture par un professionnel
  du droit et ne préjuge pas de la recevabilité des pièces ».
- Copilote : disclaimer « L'assistant propose, vous vérifiez et validez. Il ne
  remplace pas un professionnel du droit. » sur toutes les pages.

## Limites connues

- Rendu mobile/tablette vérifié par **revue de code** (breakpoints `lg`/`xl`),
  non inspecté pixel par pixel dans un navigateur.
- Liens vers modules sans aperçu (pension, dossier, onboarding) ouvrent les pages
  réelles de l'application (habillage actuel, non refondu).
- Données entièrement fictives ; aucun branchement aux données réelles cloisonnées
  par procédure (chantier dédié ultérieur).
