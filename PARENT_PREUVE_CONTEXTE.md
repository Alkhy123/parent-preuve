# Parent Preuve — Contexte SOCLE

> **Rôle de ce fichier.**
> Ce fichier est le **socle invariant** du projet Parent Preuve : mission, règles juridiques, cadre IA, modèle central, stack, méthode de travail et garde-fous essentiels.
> Il doit être chargé en premier dans chaque nouvelle conversation.

Le code réel fait toujours foi. En cas de contradiction entre ce fichier et le dépôt, le code du dépôt gagne. L'écart doit être signalé clairement avant toute modification.

---

## Fichiers compagnons

À charger seulement quand la tâche le demande :

* **`PARENT_PREUVE_REFERENCE.md`**
  État réel daté, schéma Supabase complet, carte des fichiers, dette technique, backlog.
  À ouvrir pour coder, toucher la base, faire un audit technique ou vérifier l'existant.

* **`PARENT_PREUVE_ROADMAP_UX.md`**
  Vision produit cible, UX, idées de fonctionnalités, Super Agent IA, navigation par thème.
  À ouvrir pour le travail produit, UX, navigation, priorisation ou projection future.

* **`PARENT_PREUVE_AGENT_IA.md`**
  Architecture détaillée du Copilote Parent Preuve et du futur Agent IA.
  À ouvrir avant toute modification liée à `lib/agent/`, `app/api/agent/`, `/copilote`, Mistral, les garde-fous IA, le bouton flottant ou les fonctionnalités Agent.

Les documents de vitrine restent à part :

* `VITRINE_PARENT_PREUVE_BRIEF.md`
* `prompt_claude_refonte_design_parent_preuve.md`

---

# 0. Règles de priorité

1. **Le code réel fait foi.**
   En cas de contradiction entre documentation et code, lire le code, signaler l'écart, puis proposer une correction.

2. **Pas de dossier `src/`.**
   Tout est à la racine :

   * `app/`
   * `components/`
   * `lib/`

   Tout chemin en `src/...` dans d'anciennes notes ou d'anciens skills est obsolète.

3. **Vérifier le dépôt réel.**
   Dépôt : `Alkhy123/parent-preuve`
   Branche : `main`

   Tarball d'inspection :

   ```bash
   curl -sL "https://codeload.github.com/Alkhy123/parent-preuve/tar.gz/refs/heads/main"
   ```

4. **Optimiser les tokens.**
   Ce socle suffit pour raisonner. Ne charger les fichiers compagnons que si la tâche l'exige.

5. **Méthode de livraison.**

   * Nouveau fichier autonome : donner le fichier complet à copier-coller.
   * Modification d'un fichier existant : donner le fichier complet si plusieurs zones changent, ou un patch ciblé si le changement est très local.
   * Toujours indiquer les chemins exacts.
   * Toujours donner un test concret.

---

# 1. Vision produit

## 1.1. Phrase de mission interne

> Quand tout est confus, Parent Preuve remet de l'ordre dans les faits pour que le parent reprenne pied.

À chaque arbitrage, poser la question :

> Est-ce que cette fonctionnalité aide le parent à remettre de l'ordre et à reprendre pied ?

Si oui, elle peut entrer dans la trajectoire.
Si elle ajoute de la confusion, du conflit, de la peur ou du conseil juridique déguisé, elle doit être repoussée ou supprimée.

## 1.2. Problème résolu

Le parent séparé en conflit après une décision JAF est souvent submergé sur trois fronts :

1. **Le juridique**, qu'il ne maîtrise pas toujours.
2. **Les éléments concrets**, qu'il ne sait pas forcément identifier ou structurer.
3. **L'émotion**, qui brouille le jugement et augmente la charge mentale.

Parent Preuve sert d'abord à :

* réduire la charge mentale ;
* remettre de l'ordre ;
* montrer ce qui manque ;
* guider vers la prochaine action utile ;
* produire un dossier clair, factuel, daté et exportable.

## 1.3. Outil solo

Parent Preuve est un outil pour **un seul parent** qui constitue son dossier.

On n'invite pas l'autre parent.

Parent Preuve est donc différent des applications collaboratives de coparentalité comme 2houses ou OurFamilyWizard. On peut s'inspirer de leur clarté, mais jamais de leur logique collaborative, de leur ton léger ou de leur vocabulaire de coopération forcée.

## 1.4. Identité

L'identité navy/or sérieuse est un atout.

L'application doit rester :

* sobre ;
* claire ;
* protectrice ;
* factuelle ;
* non agressive ;
* orientée dossier ;
* compatible avec un contexte judiciaire ou préjudiciaire.

## 1.5. Vocabulaire

Ne jamais écrire :

* assistant juridique ;
* avocat IA ;
* conseiller juridique ;
* stratégie judiciaire ;
* gagner devant le juge ;
* preuve recevable ;
* preuve irréfutable ;
* équivalent huissier ;
* équivalent commissaire de justice.

Préférer :

* aide à l'organisation du dossier ;
* dossier clair et factuel ;
* trace datée ;
* preuve numérique renforcée ;
* élément à vérifier ;
* pièce ;
* justificatif ;
* chronologie ;
* synthèse factuelle ;
* brouillon à valider ;
* prochaine action utile.

## 1.6. Cible mobile

La cible à terme est une application mobile, via React Native/Expo ou PWA.

Le backend Supabase doit rester réutilisable.
Les choix techniques doivent éviter de bloquer une migration mobile.

Une app Expo séparée existe déjà :

```text
Alkhy123/parent-preuve-mobile
```

SDK 54 pinné.

---

# 2. Deux modes d'usage

## 2.1. Capture rapide

Un événement survient :

* retard ;
* absence ;
* non-représentation ;
* dépense ;
* paiement ;
* photo ;
* document ;
* message reçu.

Le parent est souvent sur mobile, stressé, dans l'urgence.

La vitesse prime.

## 2.2. Gestion de dossier

Plus tard, au calme, l'utilisateur veut :

* comprendre l'état global ;
* vérifier les soldes ;
* relire les preuves ;
* préparer un courrier ;
* préparer un export ;
* voir ce qui manque.

La vue d'ensemble prime.

## 2.3. Direction retenue

L'accueil sert la **gestion de dossier**.

La capture rapide vit par-dessus via un bouton flottant universel.

Invariant non négociable :

```text
L'IA propose, l'utilisateur valide.
```

---

# 3. Positionnement juridique

Parent Preuve ne doit jamais écrire ou laisser entendre que l'application :

* remplace un avocat ;
* donne un conseil juridique personnalisé ;
* remplace un commissaire de justice ;
* certifie une preuve comme un constat ;
* garantit la recevabilité d'une preuve ;
* garantit une issue judiciaire ;
* prédit une décision judiciaire ;
* dit quoi demander au juge ;
* rédige des conclusions judiciaires prêtes à déposer.

Formulations autorisées :

* aide à l'organisation du dossier ;
* aide à la rédaction factuelle ;
* preuve numérique renforcée ;
* preuve scellée et horodatée ;
* traçabilité renforcée ;
* soumis à l'appréciation du juge ;
* à faire relire par un professionnel du droit si nécessaire.

## 3.1. Preuves photo

Les preuves photo doivent être présentées comme :

```text
preuve numérique renforcée, scellée et horodatée
```

L'horodatage actuel est **non qualifié au sens eIDAS**.

Il faut le dire honnêtement partout, notamment dans les exports PDF.

Ne jamais présenter une preuve photo comme équivalente à un constat de commissaire de justice.

Pour un relevé de présence ou de géolocalisation, dire :

```text
relevé de présence horodaté
```

Ne jamais dire :

```text
constat
```

## 3.2. Données personnelles

Tout export contenant des données personnelles doit afficher un avertissement avant téléchargement.

Une éventuelle page de vérification publique ne doit jamais exposer de données sensibles :

* nom d'enfant ;
* nom de l'autre parent ;
* adresse ;
* photo originale ;
* document judiciaire ;
* données médicales ;
* contenu familial sensible.

## 3.3. Élément matériel, jamais élément moral

L'application documente des faits constatables :

* montant dû ;
* montant payé ;
* date ;
* absence de remboursement ;
* existence d'une clause ;
* modalité de visite ;
* échéance ;
* présence d'un justificatif.

Elle ne qualifie jamais l'intention.

Ne pas utiliser :

* abandon de famille ;
* mauvaise foi ;
* mensonge ;
* manipulation ;
* pervers narcissique ;
* faute ;
* parent en tort.

Préférer :

* il ressort de la pièce ;
* le texte mentionne ;
* l'utilisateur indique ;
* cet élément pourrait être soumis à l'appréciation du juge ;
* écart constaté ;
* point à vérifier ;
* information manquante.

## 3.4. Articles de loi

Les articles de loi sont saisis et vérifiés par l'utilisateur.

L'IA ne doit jamais inventer un article de loi, une jurisprudence, une procédure ou une règle applicable.

---

# 4. Cadre IA

## 4.1. Principe central

```text
L'IA propose.
L'utilisateur relit.
L'utilisateur valide.
L'application exécute seulement après validation explicite.
```

Aucune écriture IA en base sans validation humaine.

Toute proposition IA doit rester contrôlée par l'utilisateur avant d'être enregistrée, envoyée, exportée ou utilisée.

## 4.2. Règles absolues

L'IA ne doit pas :

* inventer un fait ;
* inventer un article de loi ;
* qualifier juridiquement les faits ;
* inférer l'intention d'un parent ;
* inférer un statut procédural depuis le seul type de décision ;
* promettre une recevabilité ;
* promettre un résultat ;
* dire quoi demander au juge ;
* rédiger des conclusions judiciaires prêtes à déposer.

L'IA doit :

* signaler ses incertitudes ;
* rester factuelle ;
* citer le passage source quand elle extrait une règle ;
* produire des sorties structurées quand c'est nécessaire ;
* fonctionner côté serveur uniquement ;
* respecter le consentement IA ;
* respecter les quotas ;
* refuser en cas de doute.

## 4.3. Mistral

Fournisseur IA : Mistral.

Règles :

* appels côté serveur uniquement ;
* clé jamais en `NEXT_PUBLIC_` ;
* fournisseur UE/RGPD ;
* sous-traitant RGPD nommé ;
* DPA article 28 ;
* pas d'envoi sans consentement ;
* minimisation stricte.

## 4.4. Données de santé

Parent Preuve n'est pas HDS.

Règle stricte :

```text
Ne jamais envoyer de données de santé à l'IA.
```

Les justificatifs médicaux peuvent exister dans le dossier utilisateur, mais ils doivent être traités avec minimisation et prudence.

## 4.5. Anti-hallucination

Les sorties IA doivent être structurées et validées.

Invariant :

```text
valeur: null => confiance: "absente"
```

Format recommandé par champ :

```ts
{
  valeur: string | number | null;
  confiance: "forte" | "moyenne" | "faible" | "absente";
  citation: string | null;
}
```

## 4.6. Consentement et quota

* Consentement IA granulaire par fonctionnalité.
* Table : `consentements_ia`.
* Quota durable fail-closed.
* Erreur de comptage = refus.
* Jamais de permission implicite en cas d'erreur.
* `ConsentementIA.tsx` est la porte réutilisable qui enveloppe toute fonctionnalité IA.
* Contrôle **côté serveur** imposé : le consentement est revérifié en base avant
  tout appel Mistral, après authentification et avant le quota (helper
  `lib/consentementIaServeur.ts`, fail-closed HTTP 403). Couvre `/api/ia/reformuler`,
  `/api/ia/extraire`, `/api/ia/extraire-pdf` ; protégé par
  `scripts/check-ia-consent-boundaries.mjs` dans le build.

## 4.7. Déterministe d'abord

L'IA ne doit être utilisée que là où elle apporte une valeur réelle.

Si une règle déterministe suffit, préférer la règle déterministe.

---

# 5. Copilote Parent Preuve et Agent IA

## 5.1. Nom et positionnement

Nom recommandé :

```text
Copilote Parent Preuve
```

Sous-titre recommandé :

```text
Votre aide pour organiser un dossier clair et factuel.
```

Le Copilote n'est pas :

* un assistant juridique ;
* un avocat IA ;
* un conseiller juridique ;
* un moteur de stratégie judiciaire ;
* un outil d'action automatique.

Le Copilote est :

* une aide d'organisation ;
* une aide de priorisation ;
* une aide de reformulation neutre ;
* une aide de pré-remplissage validable ;
* une aide de compréhension du dossier ;
* une couche de réduction de charge mentale.

## 5.2. Rôle autorisé

Le Copilote peut aider à :

* comprendre l'état du dossier ;
* repérer les informations manquantes ;
* proposer une prochaine action utile ;
* orienter vers la bonne page ;
* reformuler de manière neutre ;
* préparer des brouillons factuels à valider ;
* expliquer le fonctionnement de l'application ;
* réduire l'effet fourre-tout.

## 5.3. Interdictions

Le Copilote ne doit jamais :

* donner un conseil juridique personnalisé ;
* dire quelle procédure engager ;
* dire quoi demander au juge ;
* rédiger des conclusions judiciaires prêtes à déposer ;
* prédire une décision judiciaire ;
* qualifier juridiquement les faits ;
* garantir la recevabilité d'une preuve ;
* promettre un résultat ;
* modifier ou envoyer quelque chose sans validation humaine ;
* envoyer un email sans confirmation ;
* envoyer une LRE sans confirmation ;
* supprimer une donnée sans confirmation.

## 5.4. Architecture Agent actuelle

Le socle Agent est dans :

```text
lib/agent/
```

Fichiers actuels :

```text
lib/agent/types.ts
lib/agent/catalogueActions.ts
lib/agent/gardeFous.ts
lib/agent/orientation.ts
lib/agent/index.ts
```

Route Agent dry-run :

```text
app/api/agent/analyser-demande/route.ts
```

Page de test :

```text
app/copilote/page.tsx
```

Widget d'accueil :

```text
components/WidgetCopiloteDossier.tsx
```

Bouton flottant :

```text
components/AssistantFlottant.tsx
```

La section "M'orienter" du bouton flottant doit appeler :

```text
/api/agent/analyser-demande
```

et non l'ancienne route :

```text
/api/assistant/aiguiller
```

## 5.5. Phases d'évolution Agent

### Phase 1 : lecture seule

Statut prioritaire.

Autorisé :

* lire un état limité ;
* orienter vers une page ;
* expliquer ce qui semble incomplet ;
* afficher une prochaine action utile ;
* refuser les demandes sensibles.

Interdit :

* écrire en base ;
* créer un élément ;
* modifier un élément ;
* supprimer un élément ;
* envoyer un message ;
* produire un acte juridique.

### Phase 2 : brouillons validables

Autorisé :

* brouillon de journal ;
* brouillon de frais ;
* brouillon de courrier ;
* brouillon de synthèse factuelle ;
* brouillon de chronologie.

Règle :

```text
Le brouillon doit être relu et validé par l'utilisateur avant enregistrement.
```

### Phase 3 : actions confirmées

Autorisé uniquement après confirmation explicite :

* ouvrir une page ;
* créer un brouillon ;
* préparer un export ;
* lier un élément choisi ;
* lancer une vérification.

Toujours interdit :

* supprimer une preuve automatiquement ;
* envoyer un email automatiquement ;
* envoyer une LRE automatiquement ;
* déposer un acte ;
* rédiger des conclusions prêtes à déposer ;
* décider à la place de l'utilisateur.

## 5.6. Document détaillé

Avant tout travail sur le Copilote, l'Agent IA, Mistral, les garde-fous, le bouton flottant ou les routes Agent, lire :

```text
PARENT_PREUVE_AGENT_IA.md
```

---

# 6. Modèle central : cloisonnement par procédure

Le bon conteneur du dossier n'est pas l'enfant, mais la **procédure**.

Une procédure correspond à :

```text
un autre parent + son jugement
```

Un parent peut avoir des enfants de plusieurs ex, donc plusieurs procédures.

## 6.1. Règle de regroupement

Les enfants ayant le même autre parent partagent la même procédure :

* même autre parent ;
* même jugement ;
* mêmes règles pension ;
* mêmes règles DVH ;
* mêmes règles frais ;
* mêmes décisions.

Autre parent différent = procédure séparée.

## 6.2. Granularité conservée

Documents, preuves, événements et frais peuvent rester rattachés à l'enfant,
mais le rattachement à la procédure est désormais **direct** (`procedure_id`),
plus déduit de l'enfant.

Cible (atteinte) :

```text
Chaque donnée métier appartient directement à une procédure via procedure_id.
Le rattachement enfant reste facultatif lorsqu'il n'est pas pertinent.
Une donnée sans enfant reste visible uniquement dans sa procédure.
Une donnée ambiguë héritée n'est jamais dupliquée ni attribuée automatiquement.
```

État au 23 juin 2026 : le chantier de cloisonnement P0/P1 est **terminé côté
code**. Le plan et l'historique détaillés sont dans
`PARENT_PREUVE_CONTEXTE_AUDIT_ETAT_ACTUEL.md`.

* Structure : migration `009` ajoute `procedure_id` direct sur `events`,
  `expenses`, `documents`, `preuves_photo` (nullable pendant la transition),
  avec backfill déterministe (jamais d'attribution arbitraire) et contraintes
  composites garantissant que procédure, enfant et document liés appartiennent
  au même utilisateur et à la même procédure (`procedure_id` en
  `ON DELETE RESTRICT`).
* Écritures : chaque création enregistre `procedure_id` (procédure active, ou
  héritée de l'enfant pour le calendrier de visites).
* Lectures, résumés et exports : filtrés **en base** par `procedure_id`. La
  règle héritée `child_id === null || idsProc.has(child_id)` a été retirée comme
  mécanisme de cloisonnement ; le filtre enfant ne reste qu'un garde-fou
  secondaire. Sans procédure active, aucune donnée métier n'est remontée.
* Lignes héritées ambiguës (`procedure_id = null`) : exclues des vues strictes et
  récupérables via l'écran de rattachement manuel `app/rattacher`. Le passage des
  colonnes en `NOT NULL` reste à faire après résolution de ces lignes.
* Suppressions (enfant / procédure) : explicites, confirmées et robustes
  (helper `lib/suppressionDonnees.ts`), sans transformation silencieuse en
  donnée « générale » ni nettoyage partiel.
* Intégrité : migration `012` ajoute `WITH CHECK (auth.uid() = user_id)` sur les
  UPDATE qui en manquaient.

`garde_regles` reste cloisonné par enfant (pas encore de `procedure_id` direct ;
étape secondaire). La pension est cloisonnée par `procedure_id` (jamais par
enfant).

## 6.3. Procédure active

Point unique :

```text
lib/procedureActive.ts
```

Stockage :

```text
localStorage
```

Clé :

```text
procedure_active_id
```

Fonction clé :

```text
getEnfantsDeProcedureActive()
```

Sélection visible via :

```text
SelecteurProcedure.tsx
BandeauProcedure.tsx
```

Changer de procédure recharge la page.

## 6.4. Exception volontaire

Tous les écrans liés à l'enfant sont cloisonnés.

Exception voulue :

```text
/enfants
```

Cette page charge tous les enfants, toutes procédures confondues. C'est le hub où l'on répartit les enfants.

Le détail des colonnes `procedure_id`, des tables de règles et des écrans concernés est dans :

```text
PARENT_PREUVE_REFERENCE.md
```

---

# 7. Stack technique

## 7.1. Framework

* Next.js 16.2.6
* App Router
* TypeScript 5
* React 19.2.4
* Tailwind CSS 4
* `@tailwindcss/postcss`

Route serveur :

```text
route.ts
```

Une fonction par méthode HTTP.

Exemple :

```ts
export async function POST(request: Request) {}
```

Règles Next.js 16 :

* `headers()` et `cookies()` sont async ;
* jamais de `page.tsx` sous `app/api/` ;
* nouveau dossier de route/page = redémarrer `npm run dev`.

## 7.2. Backend

Supabase :

* PostgreSQL ;
* Auth ;
* Storage ;
* RLS partout ;
* buckets privés.

Client navigateur :

```text
@/lib/supabase
```

Auth :

* entièrement côté navigateur ;
* pas de `@supabase/ssr` ;
* pas de middleware ;
* routes serveur protégées par token Bearer.

Service role :

```text
lib/supabaseAdmin.ts
```

Variable réservée serveur :

```text
SUPABASE_SERVICE_ROLE_KEY
```

## 7.3. IA

Mistral :

```text
https://api.mistral.ai/v1/chat/completions
```

Bearer token côté serveur.

Modèles centralisés dans :

```text
lib/modelesIA.ts
```

Modèles actuels :

* reformulation : `mistral-medium-2604`
* extraction : `mistral-small-2603`
* OCR : `mistral-ocr-2512`

Changer un modèle = modifier une seule ligne dans `lib/modelesIA.ts`.

## 7.4. PDF

Bibliothèques :

* `jspdf` ^4.2 ;
* `jspdf-autotable` ^5 ;
* `pdf-lib` ^1.17 ;
* `unpdf` ^1.6.

Usages :

* `jspdf` et `jspdf-autotable` pour génération ;
* `pdf-lib` pour fusion ;
* `unpdf` pour lecture PDF numérique.

## 7.5. Environnement et déploiement

Live :

```text
https://parent-preuve.vercel.app
```

Déploiement :

* Vercel Hobby ;
* déploiement automatique sur push `main`.

Variables `.env.local` :

```text
HORODATAGE_SECRET
MISTRAL_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NODE_OPTIONS=--use-system-ca
```

`NODE_OPTIONS=--use-system-ca` est utile en local Windows pour certains problèmes TLS, mais ne doit pas être mis sur Vercel.

`HORODATAGE_SECRET` est immuable après déploiement, car il signe les preuves existantes.

---

# 8. Identité visuelle

## 8.1. Palette

* Navy : `#15233F`
* Or : `#C2A24C`
* Texte : `#1F2733`
* Fond de page : `#ECE7DC`
* Surface carte : `#F8F6F1`
* Texte doux : `#5A6473`

Couleurs de statut :

* Vert : `#2E6A4D`
* Rouge : `#9B2C2C`
* Ambre : `#8A5A12`

## 8.2. Typographies

* Titres : Playfair Display via `.font-display`
* Corps : Geist

## 8.3. Composants socles

À réutiliser :

```text
PageHeader.tsx
EncartPliable.tsx
.carte
ConsentementIA.tsx
components/ui/FormMessage.tsx
components/ui/EmptyState.tsx
components/ui/OptionsAvancees.tsx
```

`EncartPliable.tsx` utilise notamment :

```text
idPersistance
signalFermeture
```

Composants UI partagés (formulaires) :

```text
FormMessage      message succès / erreur unifié
EmptyState       état vide sobre, action suivante facultative
OptionsAvancees  repli des champs avancés (saisie progressive)
```

## 8.4. Tokens

Tokens de design centralisés dans :

```text
app/globals.css
```

Tokens à privilégier :

* `bg-navy`
* `text-or` (or vif : réservé aux fonds navy, traits, accents)
* `text-or-fonce` (or foncé `#7A6326`, lisible AA : texte doré sur fond clair)
* `bg-surface`
* `text-texte-doux`
* `text-vert`
* `text-rouge`
* `text-amber`

La migration des hex en dur vers les tokens est progressive, page par page.

Classes UI communes (adoption progressive page par page) :

```text
.btn + .btn-primaire / .btn-secondaire / .btn-discret / .btn-danger
.badge + .badge-succes / .badge-attention / .badge-erreur / .badge-info / .badge-neutre
```

`.carte` : ombre à 3 couches (contact net + ombre portée profonde teintée navy),
relief marqué pour détacher la carte du fond crème.

## 8.5. Règles design

* Jamais de double séparation : soit ombre `.carte`, soit bordure dure, pas les deux.
* Bannir progressivement les gris Tailwind par défaut quand un gris palette existe.
* L'or vif reste rare et ne sert jamais de texte sur fond clair (contraste insuffisant) : utiliser `text-or-fonce`. Un seul accent fort par écran.
* Boutons : une seule action principale par écran (`.btn-primaire`) ; secondaires moins visibles ; actions dangereuses séparées (`.btn-danger`).
* Une seule action principale par écran.
* Rester sur l'échelle d'espacement Tailwind.

---

# 9. Méthode de travail

## 9.1. Méthode non négociable

L'utilisateur est développeur débutant et travaille parfois sur mobile.

Toujours :

* expliquer simplement ;
* donner les chemins exacts ;
* avancer une étape testable à la fois ;
* proposer un test concret ;
* attendre un `go` explicite avant chaque étape risquée ;
* ne pas modifier plusieurs couches à la fois.

Ordre recommandé :

```text
audit live
audit code
proposition
risques
test
go explicite
patch minimal
déploiement Vercel
validation
étape suivante
```

## 9.2. Ordre technique recommandé

Quand une fonctionnalité touche plusieurs couches :

```text
table/SQL
logique pure
route API
composant
branchement page
test Vercel
```

## 9.3. Format des modifications

* Remplacement complet du fichier si plusieurs zones changent.
* Patch ciblé si une seule zone change.
* Toujours préciser la dernière ligne complète à vérifier quand c'est utile.
* Toujours donner le commit conseillé.
* Toujours donner le test attendu.

## 9.4. Réutiliser l'existant

Réutiliser avant de créer :

```text
PageHeader
EncartPliable
ConsentementIA
ReglePension
RegleDvh
RegleFrais
RegleDecision
dossierCalculs.ts
procedureActive.ts
/api/ia/reformuler
/api/ia/extraire
lib/agent
patterns Supabase/RLS
```

## 9.5. Anti-dispersion

Ne pas proposer dix solutions si une suffit.

Recommander une option principale, mentionner brièvement l'alternative, expliquer pourquoi.

## 9.6. Anti-surarchitecture

Ne pas créer de nouvelle table, couche, service ou abstraction si l'existant suffit.

---

# 10. Workflow réel

## 10.1. Mobile

L'utilisateur travaille souvent sur téléphone, directement sur GitHub :

```text
crayon
tout sélectionner
coller
Commit changes
```

Nouveau fichier :

```text
Add file
Create new file
```

On peut créer un sous-dossier en tapant un chemin comme :

```text
docs/NOM.md
```

Vercel redéploie sur push.

## 10.2. PC / Cursor

Workflow :

```bash
git pull
npm install
recréer .env.local
npm run dev
git add
git commit
git push
```

## 10.3. Pièges vécus

* Mauvaise extension : `.ts` au lieu de `.tsx` pour du JSX.
* Collage confirmé mais non commité.
* Deux clones locaux différents.
* Push depuis le mauvais dossier.
* `nothing to commit` alors qu'un autre clone contient les modifications.
* Build Vercel rouge : Vercel sert encore l'ancienne version.
* Nouveau dossier de route/page sans redémarrer `npm run dev`.

## 10.4. PowerShell / Windows

Tester une route serveur :

```powershell
Invoke-RestMethod -Uri "URL" -Method Post -ContentType "application/json" -Body '{...}'
```

Éviter `curl` dans PowerShell, car c'est souvent un alias de `Invoke-WebRequest`.

Correctif TLS local :

```text
NODE_OPTIONS=--use-system-ca
```

Ne jamais mettre ce correctif sur Vercel.

Secret aléatoire sans OpenSSL :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 10.5. TypeScript et build

Next.js 16 ne lance plus forcément ESLint comme blocage principal.

Le type-check TypeScript peut bloquer Vercel.

En cas de doute sur un build :

```bash
npx tsc --noEmit
```

Sur mobile, le test de référence reste :

```text
déploiement Vercel vert
```

---

# 11. Checklist avant toute réponse de code

Avant de proposer du code, vérifier :

* Positionnement juridique respecté ?
* Pas de conseil juridique personnalisé ?
* Pas de promesse de résultat ?
* Pas de promesse de recevabilité ?
* Cloisonnement par procédure respecté ?
* Secrets côté serveur ?
* Pas de clé sensible en `NEXT_PUBLIC_` ?
* RLS et Supabase respectés ?
* Validation humaine prévue pour toute sortie IA ?
* Garde-fous Agent respectés si la modification touche le Copilote ?
* `PARENT_PREUVE_AGENT_IA.md` lu si la modification touche l'Agent IA ?
* Test concret donné ?
* Étape suffisamment petite ?
* Compatibilité future mobile prise en compte ?
* Réponse optimisée pour les tokens ?

---

# 12. Résumé final

Parent Preuve doit rester :

```text
solo,
factuel,
sobre,
prudent,
utile,
orienté dossier,
centré sur la validation humaine.
```

Parent Preuve ne doit jamais devenir :

```text
un avocat IA,
un assistant juridique,
un moteur de stratégie judiciaire,
un outil de promesse judiciaire,
un outil d'action automatique,
un outil pour piéger l'autre parent.
```

Règle finale :

```text
Quand il y a un doute, refuser, recadrer et ramener l'utilisateur vers l'organisation factuelle du dossier.
```
