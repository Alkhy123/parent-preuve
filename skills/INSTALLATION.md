# Installation des Claude Skills — Parent Preuve

Ce pack contient des skills Claude prêtes à copier dans ton projet :

```text
c:\projets\parent-preuve
```

## Option 1 — Installation manuelle

1. Dézippe ce pack.
2. Copie le dossier `.claude` dans :

```powershell
c:\projets\parent-preuve\.claude
```

3. Copie ou fusionne le contenu de `CLAUDE.addon.md` dans :

```powershell
c:\projets\parent-preuve\CLAUDE.md
```

4. Vérifie que tu as bien :

```text
c:\projets\parent-preuve\.claude\skills\parent-preuve-context\SKILL.md
c:\projets\parent-preuve\.claude\skills\jugement-pdf-import\SKILL.md
...
```

## Option 2 — Installation PowerShell

Depuis le dossier dézippé, lance :

```powershell
.\install_parent_preuve_skills.ps1
```

Ou avec un chemin personnalisé :

```powershell
.\install_parent_preuve_skills.ps1 -ProjectPath "c:\projets\parent-preuve"
```

Le script :

- crée `.claude\skills` si besoin
- copie les skills
- crée `CLAUDE.md` s’il n’existe pas
- sinon ajoute le contenu de `CLAUDE.addon.md` à la fin de `CLAUDE.md`

## Utilisation dans Claude Code

Dans Claude Code, tu peux demander :

```text
/parent-preuve-context

Lis PARENT_PREUVE_CONTEXTE.md et prépare le chantier import PDF.
Utilise ensuite /jugement-pdf-import et /mistral-json-extraction.
```

Pour relire une grosse modification :

```text
/legal-security-code-review

Relis la fonctionnalité import PDF sous les angles code, sécurité, RGPD, IA et prudence juridique.
```

## Skills externes conseillées

À installer à part si tu utilises `npx skills` :

```powershell
npx skills add supabase/agent-skills
```

Skills Next.js communautaires utiles :

```text
https://github.com/laguagu/claude-code-nextjs-skills
```

Ces skills externes ne sont pas incluses dans ce pack pour éviter de mélanger ton contexte métier avec du code tiers.
