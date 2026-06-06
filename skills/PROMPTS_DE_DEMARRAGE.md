# Prompts de démarrage pour Claude Code

## 1. Démarrer une tâche normale

```text
/parent-preuve-context

Lis PARENT_PREUVE_CONTEXTE.md et AGENTS.md si présent.
Je veux que tu travailles étape par étape, en expliquant simplement les fichiers modifiés et les tests à faire.
```

## 2. Lancer le chantier import PDF

```text
/parent-preuve-context
/jugement-pdf-import
/mistral-json-extraction
/rgpd-donnees-familiales

Objectif : créer la porte 2 d'import PDF du jugement.

Première étape souhaitée :
1. créer la page /dossier/import-pdf
2. créer la route /api/ia/extraire-pdf
3. extraire le texte du PDF côté serveur
4. cibler prioritairement le dispositif
5. renvoyer le même JSON sectionné que /api/ia/extraire
6. réutiliser les 4 encarts ReglePension, RegleFrais, RegleDVH, RegleDecision

Ne valide aucune règle automatiquement.
Toute proposition IA doit rester source='ia' et valide=false.
Donne-moi les tests navigateur et PowerShell.
```

## 3. Relire une fonctionnalité

```text
/legal-security-code-review

Relis la dernière modification sous les angles :
- code
- TypeScript
- Supabase/RLS
- RGPD
- IA
- prudence juridique
- tests de non-régression

Réponds avec :
1. Points OK
2. Risques bloquants
3. Risques non bloquants
4. Corrections proposées
5. Tests à faire
```

## 4. Travailler sur Supabase

```text
/parent-preuve-context
/supabase-rls-parent-preuve
/rgpd-donnees-familiales

Je veux modifier la base Supabase.
Respecte les conventions du projet :
- user_id default auth.uid()
- RLS partout
- policies par utilisateur
- aucune service role key côté client
- aucun log sensible
```

## 5. Travailler sur preuve photo

```text
/parent-preuve-context
/preuve-photo-mobile
/rgpd-donnees-familiales
/legal-security-code-review

Je veux améliorer le module preuve photo.
Ne dis jamais que la preuve équivaut à un constat de commissaire de justice.
Préserve l’original, le hash, l’horodatage, le GPS et les anomalies.
```
