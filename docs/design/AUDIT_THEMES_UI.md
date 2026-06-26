# Audit thèmes — aperçus de design Parent Preuve

Trois thèmes via tokens CSS `--app-*` (voir `app/globals.css`), appliqués par
`data-theme` sur `<html>`, persistés en `localStorage` (`parent-preuve-theme`).
Surcharges scopées à `.apercu-shell` → **le reste de l'application n'est pas
affecté**. Données fictives, aucune logique métier modifiée.

## Légende

- **OK** : vérifié (revue de code + build).
- **OK (code)** : conformité vérifiée par revue de code et tokens ; rendu non
  inspecté pixel par pixel en navigateur.

## Thèmes

| Thème | id technique | Ambiance |
|---|---|---|
| Classique bleu | `classique-bleu` | Clair, moderne, rassurant (base actuelle) |
| Ivoire & Greffe | `ivoire-greffe` | Clair, institutionnel, ivoire / bronze / brun |
| Noir & Or sombre | `noir-or-sombre` | Sombre, premium, noir charbon / accents or |

## Couverture par page et par thème

| Thème | Dashboard | Journal | Frais | Documents | Preuves | Synthèses | Mobile | Contraste | Remarques |
|---|---|---|---|---|---|---|---|---|---|
| Classique bleu | OK | OK | OK | OK | OK | OK | OK (code) | OK | Base inchangée visuellement |
| Ivoire & Greffe | OK (code) | OK (code) | OK (code) | OK (code) | OK (code) | OK (code) | OK (code) | OK | Fond ivoire, sidebar beige, primaire bronze, bordures chaudes |
| Noir & Or sombre | OK (code) | OK (code) | OK (code) | OK (code) | OK (code) | OK (code) | OK (code) | OK | Fond charbon, sidebar noire, cartes gris foncé, accents or, texte clair |

Tous les thèmes sont pilotés par les **mêmes** tokens, donc les pages partagent
automatiquement la couverture (surfaces, sidebar, topbar, cartes, boutons,
filtres, copilote, encart conseil, progress bars, recherche, bordures, fond).

## Éléments couverts par le thème

- Fond général, surfaces, surfaces atténuées.
- Sidebar (`--app-sidebar`) + item actif (`--app-sidebar-active`).
- Topbar, cartes, boutons primaires/secondaires, champs de recherche.
- Tags / pastilles de filtre actives, progress bars, bordures.
- Copilote (colonne droite + feuille mobile), encart conseil, disclaimer.
- Bandeau « Aperçu » : adapté au thème (`--app-banner-*`) — sur thème sombre,
  fond brun foncé + bordure/texte or (pas de jaune agressif).
- Texte sur primaire (`--app-on-primary`) : foncé sur l'or du thème sombre pour
  garder un contraste suffisant.

## Accessibilité / contraste

- Texte principal : `#0F172A` (clair) / `#1F2933` (ivoire) / `#F8FAFC` (sombre).
- Texte secondaire sombre : `#CBD5E1` (pas de gris faible type `#666`).
- Boutons primaires lisibles sur les 3 thèmes (texte clair sur bleu/bronze,
  texte foncé sur or).
- Badges sémantiques (succès/attention/danger) conservés en pastilles claires à
  texte foncé : restent lisibles sur fond clair comme sombre.

## Sélecteur de thème

- Composant `components/theme/ThemeSelector.tsx` : 3 cartes (nom, description,
  3 pastilles, état sélectionné), dans `Paramètres → Apparence`
  (`/apercu/parametres`).
- Persistance `localStorage` (`parent-preuve-theme`) + application immédiate
  (`data-theme`), no-flash au rechargement via script inline dans `layout.tsx`.

## Bouton flottant « + »

- `md:hidden` → visible uniquement sur mobile (< 768px) ; masqué tablette/desktop.
- Sur ≥ `md`, l'action principale d'ajout est présente dans l'en-tête du module.

## Bandeau aperçu

- Affiché uniquement si la route commence par `/apercu` (`usePathname`).
- Thémé (classe `app-banner`) : jamais jaune agressif sur thème sombre.

## Limites connues

- Rendu (notamment mobile/tablette et thème sombre) vérifié par **revue de code**
  et cohérence des tokens ; non inspecté pixel par pixel en navigateur.
- Persistance **localStorage uniquement** (pas de persistance Supabase dans cette
  passe ; aucune migration créée). API `appliquerTheme` prête pour extension.
- Badges sémantiques non re-tokenisés (pastilles claires volontairement
  conservées, lisibles sur tous les thèmes).
- `Modèles` : toujours sans page d'aperçu (hors périmètre).

## Corrections de finition

- Bouton flottant desktop : revue de code effectuee. Le bouton `+` propre au
  shell d'apercu reste en `md:hidden`. Les boutons flottants globaux
  `BoutonCaptureRapide` et `AssistantFlottant`, montes dans `app/layout.tsx`,
  sont masques sur `/apercu/*` via `pathname.startsWith("/apercu")`. A verifier
  en rendu navigateur desktop.
- Badge rouge `1 issue` : non reproduit par revue de code. Aucun avertissement
  evident lie a `ThemeProvider`, `localStorage` ou `data-theme` n'a ete identifie
  statiquement. Verification navigateur/console a documenter apres lancement
  local.
- Lisibilite `Ivoire & Greffe` : tokens ajustes vers un fond ivoire moins
  uniforme, surfaces plus claires, bordures plus marquees et accent brun/bronze
  plus sobre.
- Lisibilite `Noir & Or sombre` : tokens ajustes pour renforcer texte secondaire,
  surface attenuee, bordures, et accents or sans envahir l'interface.
- Badges/tags themes : ajout/usage des tokens `--app-info`,
  `--app-info-soft`, `--app-info-border`, `--app-tag-bg`, `--app-tag-text`,
  `--app-tag-border`, `--app-chip-bg`, `--app-chip-text`,
  `--app-chip-border`. Les statuts succes/attention/danger restent
  semantiques.
- Page Parametres amelioree : ajout d'un bouton `Reinitialiser le theme`,
  mention d'enregistrement sur cet appareil, mention de synchronisation compte
  future, et mini apercu visuel par theme.
- Responsive mobile : structure conservee. Sidebar masquee (`lg:flex`),
  copilote permanent masque sous `xl`, navigation basse mobile conservee, FAB
  interne visible seulement sous `md`. A verifier en navigateur mobile.
- Limites restantes : rendu pixel par pixel, persistance apres refresh et absence
  du badge `1 issue` restent a confirmer en navigateur local sur les routes
  d'apercu.
