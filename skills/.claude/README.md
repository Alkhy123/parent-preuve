# Parent Preuve — Pack de skills urgentes

Ce pack contient les skills les plus urgentes à ajouter à ton projet, en complément du premier pack.

## Skills incluses

1. `pdf-extraction-quality-audit`
2. `ia-extraction-regression-tests`
3. `parent-preuve-error-ux`
4. `supabase-safe-migrations`
5. `legal-copywriting-france`

## Pourquoi ces skills

Elles correspondent aux chantiers les plus sensibles de ton projet :

- import PDF du jugement
- extraction IA fiable
- tests anti-régression des prompts
- messages d’erreur clairs
- migrations Supabase propres
- formulation juridique prudente

## Installation Claude Code / Cursor

Copier le dossier `.claude` à la racine de ton projet :

```text
c:\projets\parent-preuve\.claude
```

Ou lancer le script PowerShell :

```powershell
.\install_skills_urgentes.ps1
```

Avec chemin personnalisé :

```powershell
.\install_skills_urgentes.ps1 -ProjectPath "c:\projets\parent-preuve"
```

## Utilisation dans Claude Code

Exemples :

```text
/pdf-extraction-quality-audit
Audite la route d’import PDF et vérifie que le dispositif est bien ciblé.
```

```text
/ia-extraction-regression-tests
Crée les tests anti-régression pour la route /api/ia/extraire.
```

```text
/parent-preuve-error-ux
Améliore les messages d’erreur de la page d’import PDF.
```

```text
/supabase-safe-migrations
Prépare une migration pour ajouter le statut sur events.
```

```text
/legal-copywriting-france
Réécris ces avertissements dans un style juridique prudent et compréhensible.
```

## Utilisation dans Claude.ai web

Pour Claude.ai web, tu peux utiliser ce pack comme référence, mais le plus pratique est d’uploader chaque skill séparément si Claude.ai te le permet.

Sinon, tu peux ouvrir les fichiers `SKILL.md`, copier leur contenu, et le coller au début de ta conversation Claude.ai avec ton fichier contexte.
