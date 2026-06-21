@AGENTS.md

Approach

Read existing files before writing. Don't re-read unless changed. Thorough in reasoning, concise in output. Skip files over 100KB unless required. No sycophantic openers or closing fluff. No emojis or em-dashes. Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

Project context

Always read `PARENT_PREUVE_CONTEXTE.md` first at the start of a new task.

Load companion files only when useful for the task:

* `PARENT_PREUVE_REFERENCE.md` for real schema, file map, Supabase, debt, backlog, coding or technical audit.
* `PARENT_PREUVE_ROADMAP_UX.md` for product, UX, navigation, roadmap or future features.
* `PARENT_PREUVE_AGENT_IA.md` for any work on the Copilote Parent Preuve, Agent IA, assistant, Mistral routes, guardrails, AI-powered dossier features, `lib/agent/`, `app/api/agent/`, `app/copilote/`, `components/AssistantFlottant.tsx`, or `components/WidgetCopiloteDossier.tsx`.

Agent IA rules

For any Agent IA work:

* Do not present the Copilote as a legal assistant.
* Do not create personalized legal advice.
* Do not generate judicial conclusions ready to file.
* Do not promise admissibility, proof value or judicial outcome.
* Do not bypass `lib/agent`.
* Do not add Mistral calls before guardrails and response validation are in place.
* Do not create automatic writes.
* Do not send or delete anything without explicit user confirmation.
* Keep the rule: AI proposes, user verifies, user validates.

## Séparation Assistant historique / Agent nouvelle génération

Le projet contient deux générations IA qui cohabitent temporairement.

Assistant historique encore utilisé en production :
- `app/api/assistant/repondre/route.ts`
- `app/api/assistant/pre-remplir/route.ts` a été supprimée après migration vers `/api/agent/pre-remplir`.

Agent nouvelle génération :
- `app/api/agent/analyser-demande/route.ts`
- `app/api/agent/repondre/route.ts`
- `app/api/agent/pre-remplir/route.ts`
- `app/api/agent/question-dossier/route.ts`
- `lib/agent/`
- `app/copilote/`

Règles obligatoires :
- Ne jamais fusionner les routes `assistant` et `agent`.
- Ne jamais mettre Mistral, quota IA, consentement IA ou validation Mistral dans `app/api/agent/analyser-demande/route.ts`.
- `app/api/agent/analyser-demande/route.ts` doit rester une route dry-run déterministe : authentification, garde-fous, orientation, aucune écriture.
- `app/api/agent/analyser-demande/route.ts` est la seule route Agent qui n'appelle pas Mistral ; `repondre`, `pre-remplir` et `question-dossier` appellent Mistral derrière garde-fous, consentement, quota et validateur.
- `app/api/agent/question-dossier/route.ts` est la nouvelle route expérimentale de question dossier (contrat `agent-question-dossier-v1`), testée dans `/copilote`. Elle ne doit rien écrire en base métier.
- `components/AssistantFlottant.tsx` ne doit pas appeler directement `/api/agent/repondre` ni `/api/agent/question-dossier`.
- `components/AssistantFlottant.tsx` garde `/api/assistant/repondre` pour la question dossier tant que la migration vers `/api/agent/question-dossier` n'est pas validée.
- `/api/agent/repondre` et `/api/agent/question-dossier` restent réservés au test avancé via `/copilote`, tant qu’une étape dédiée de mise en production n’a pas été validée.
- Avant tout commit touchant l’Agent ou le bouton flottant, lancer `npm run check:agent-boundaries`.


Development method

Use one small testable step at a time.

Before code:

1. Audit live when relevant.
2. Audit existing code.
3. Propose the plan.
4. List files.
5. List risks.
6. List the exact Vercel test.
7. Wait for explicit go.

After code:

1. Provide exact files or exact replacement blocks.
2. Prefer complete files when several areas change.
3. Give the commit command.
4. Give the expected Vercel result.
