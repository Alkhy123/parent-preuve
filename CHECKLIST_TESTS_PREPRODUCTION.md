# Checklist de tests pré-production — Parent Preuve

Tests manuels de bout en bout après le chantier de stabilisation (blocs P0/P1).
Cocher au fur et à mesure. Tout est à faire avec des données réalistes.

Dépôt : `Alkhy123/parent-preuve` — branche `main`.

---

## 0. Prérequis avant de tester

- [ ] Pousser la migration **014** : `supabase db push` (table `audit_log`).
      Tant qu'elle n'est pas appliquée, l'audit échoue silencieusement (pas de
      casse d'UX, mais rien n'est tracé).
- [ ] Vérifier que le déploiement Vercel est **vert** sur le dernier commit `main`.
- [ ] Se connecter avec un compte de test (pas un vrai dossier).

---

## 1. P1-D — Cloisonnement strict : deux procédures (test prioritaire)

But : aucune donnée de la procédure A ne doit apparaître dans la procédure B.

### Préparation
- [ ] Créer **procédure A** (autre parent A) avec **enfant A1**.
- [ ] Créer **procédure B** (autre parent B) avec **enfant B1**.

### Saisie dans procédure A (la sélectionner d'abord)
- [ ] 1 événement (journal)
- [ ] 1 frais
- [ ] 1 paiement de pension
- [ ] 1 document (coffre-fort)
- [ ] 1 preuve photo
- [ ] (optionnel) 1 élément **sans enfant associé** rattaché à A

### Saisie dans procédure B (la sélectionner d'abord)
- [ ] 1 événement, 1 frais, 1 pension, 1 document, 1 preuve photo (valeurs différentes de A)

### Vérifications de non-mélange
Basculer sur **procédure A** puis contrôler chaque écran ; recommencer sur B.

- [ ] `/journal` : ne montre que les événements de la procédure active
- [ ] `/frais` : idem
- [ ] `/pension` : idem
- [ ] `/documents` et `/documents/coffre-fort` : idem
- [ ] `/preuves` : idem
- [ ] `/chronologie` : idem
- [ ] Accueil (`/`) : widgets, situation du mois, prochaines échéances = procédure active uniquement
- [ ] `/resume-mois` : aucune donnée de l'autre procédure
- [ ] L'élément **sans enfant** rattaché à A n'apparaît **jamais** dans B

### Exports cloisonnés
- [ ] Export PDF (`/export`) en procédure A : ne contient que A (chronologie, frais, pension, pièces, preuves)
- [ ] Export PDF en procédure B : ne contient que B
- [ ] Dossier avocat (`/dossier-avocat`) : même cloisonnement
- [ ] Export de portabilité (`/compte`) : contient bien tout, mais filtré par utilisateur

### Copilote / bouton flottant par procédure
- [ ] Question dossier (bouton flottant) en procédure A : répond à partir des données de A seulement
- [ ] Idem en procédure B

### Suppression sans contamination
- [ ] Supprimer un enfant non-dernier d'une procédure : ses données partent, les autres restent
- [ ] Supprimer une procédure entière : double confirmation, suppression complète, l'autre procédure intacte
- [ ] Écran `/rattacher` : liste bien les éléments orphelins (`procedure_id` null) s'il y en a

**Critère de réussite : zéro fuite entre A et B sur tous les écrans et exports.**

---

## 2. P1-C — Preuves photo et export

### Bordereau preuves dans l'export global
- [ ] `/export` → générer le PDF : présence de la section **« 5. Preuves photo »**
- [ ] Le tableau liste les preuves de la procédure active (date scellée, titre, enfant, statut horodatage, empreinte SHA-256)
- [ ] Le rappel juridique apparaît (horodatage non qualifié eIDAS, pas un constat de commissaire de justice)
- [ ] Filtre période : une preuve hors période n'apparaît pas (sauf case « toutes les pièces » cochée)
- [ ] Cas vide : « Aucune preuve photo pour cette sélection » s'affiche proprement, sans chevauchement de mise en page
- [ ] Lisibilité de la colonne empreinte (police réduite) acceptable

### Boutons sur `/preuves`
- [ ] Sur une preuve au statut **« ⚠ horodatage à refaire »** : le bouton **« Relancer l'horodatage »** apparaît
- [ ] Clic → succès → la pastille passe à **« ✓ horodaté »** sans recharger la page, message « Horodatage refait. »
- [ ] Bouton **« Vérifier l'intégrité »** présent sur une preuve normale
- [ ] Clic → message « empreinte recalculée concordante » (preuve intacte)
- [ ] Les boutons se désactivent pendant l'action (« Horodatage… » / « Vérification… »)
- [ ] Le **rapport PDF unitaire** et **« Voir l'original »** fonctionnent toujours

---

## 3. P1-B — Journal d'audit (après `supabase db push` de la 014)

Vérifier que les actions sensibles laissent une trace **technique** (jamais de contenu).

Actions à déclencher puis contrôler en base :
- [ ] Créer une preuve photo
- [ ] Relancer un horodatage
- [ ] Vérifier l'intégrité d'une preuve
- [ ] Générer un export PDF

Requête de contrôle (SQL, console Supabase) :

```sql
select action, cible_type, cible_id, procedure_id, metadonnees, created_at
from audit_log
order by created_at desc
limit 20;
```

- [ ] Les 4 actions apparaissent (`preuve.creation`, `preuve.horodatage`, `preuve.verification_hash`, `export.generation`)
- [ ] `metadonnees` ne contient **que** du technique (compteurs, booléens) — **aucun** titre, description, nom d'enfant, GPS, empreinte
- [ ] Test RLS : un autre utilisateur ne voit pas ces lignes (chaque compte ne lit que les siennes)
- [ ] Suppression de compte (`/compte`) : après suppression, plus aucune ligne `audit_log` pour cet utilisateur

---

## 4. Vérifications base restantes (côté toi)

### Comptage des lignes orphelines avant passage en NOT NULL
```sql
select 'events'        as t, count(*) from events        where procedure_id is null
union all select 'expenses',      count(*) from expenses      where procedure_id is null
union all select 'documents',     count(*) from documents     where procedure_id is null
union all select 'preuves_photo', count(*) from preuves_photo where procedure_id is null;
```
- [ ] Si tous les compteurs sont à 0 : envisager une migration passant `procedure_id` en `NOT NULL`
- [ ] Sinon : résoudre les orphelins via `/rattacher` d'abord

### Validation des 2 FK document NOT VALID
- [ ] À faire dans une migration dédiée **seulement après** vérification qu'aucune
      liaison fait/frais → pièce n'est incohérente (procédure différente) :
      `events_document_procedure_owner_fk`, `expenses_document_procedure_owner_fk`

---

## 5. Bloc 13 — Conformité RGPD contrats (vérification externe)

À vérifier dans les consoles / contrats (hors code) :
- [ ] Régions Supabase / Vercel / Mistral (UE)
- [ ] DPA / sous-traitance article 28 en place pour Mistral
- [ ] Durées de conservation et sauvegardes documentées
- [ ] Cohérence entre les textes affichés (confidentialité, mentions légales) et les contrats réels

---

## 6. Garde-fous automatisés (rappel)

Avant chaque commit touchant l'Agent ou les routes IA :
```bash
npm run lint
npm run build   # enchaîne check:agent-boundaries + check:ia-consent + check:multi-procedure-migration + next build
```
- [ ] `npm run build` reste vert
