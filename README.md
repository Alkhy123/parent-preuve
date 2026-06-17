# Parent Preuve

**Quand tout est confus, Parent Preuve remet de l'ordre dans les faits pour que le parent reprenne pied.**

Parent Preuve est un outil d'**organisation personnelle** destiné à un parent seul, en situation
de conflit co-parental après décision du Juge aux affaires familiales (JAF). L'application aide à
constituer un dossier **factuel et structuré** : journal d'événements, frais, pension, documents,
courriers, preuves photo scellées et export PDF.

> ⚠️ Parent Preuve n'est **pas** un outil de conseil juridique. Elle ne remplace ni un avocat, ni un
> commissaire de justice, et ne garantit ni la recevabilité d'une preuve ni l'issue d'une procédure.
> Les éléments produits sont destinés à être relus, validés par l'utilisateur, et le cas échéant
> soumis à l'appréciation d'un professionnel du droit.

## Principales fonctionnalités

- **Journal factuel** avec garde-fou de neutralité (détection de langage émotionnel)
- **Suivi des frais partagés** et **suivi de la pension** (statuts calculés)
- **Coffre-fort de documents** (stockage privé, accès renforcé)
- **Preuves photo** : empreinte SHA-256, horodatage, traçabilité renforcée
- **Assistant courriers** (modèles pré-remplis, validés par l'utilisateur)
- **Note de synthèse factuelle** pour un professionnel du droit
- **Extraction assistée par IA** des règles d'un jugement — *l'IA propose, l'utilisateur valide*

## Pile technique

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth + Storage), RLS sur 100 % des tables
- **Mistral AI** (hébergement EU), appelé **uniquement côté serveur**
- **jsPDF** / **jspdf-autotable** / **pdf-lib** pour les exports PDF
- Déploiement **Vercel**

Structure du dépôt à la racine : `app/`, `components/`, `lib/` (pas de dossier `src/`).

## Démarrage en local

Prérequis : Node.js 20+ et un fichier `.env.local` renseigné (voir ci-dessous).

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Les **secrets restent strictement côté serveur**. Aucune clé sensible ne doit être préfixée par
`NEXT_PUBLIC_`. À renseigner dans `.env.local` :

| Variable | Côté | Rôle |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client | Clé publique (récente), lue en priorité — protégée par RLS |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Clé anon (ancien nom), repli si PUBLISHABLE absente |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | Clé service (admin) — jamais exposée au client |
| `MISTRAL_API_KEY` | serveur | Accès Mistral AI (appels serveur uniquement) |
| `HORODATAGE_SECRET` | serveur | Signature de l'horodatage |

> Pour générer un secret sous Windows (sans OpenSSL) :
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Positionnement (règles immuables)

- L'IA **propose**, l'utilisateur **valide** avant tout enregistrement définitif.
- Les articles de loi sont **saisis et vérifiés par l'utilisateur**, jamais générés par l'IA.
- Les photos ne sont **jamais** présentées comme un constat de commissaire de justice.
- L'application documente des **faits observables**, jamais l'intention d'un parent.

---

© Parent Preuve. Usage personnel d'organisation de dossier.
