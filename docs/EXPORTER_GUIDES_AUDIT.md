# Parent Preuve — Audit espace Exporter

Date : 28 juin 2026  
Statut : étape livrée sur `main`.

---

## 1. Objectif de l’étape

L’objectif de cette étape était de transformer l’espace Exporter en véritable point d’entrée de production du dossier.

Avant cette étape, plusieurs outils existaient déjà, mais l’utilisateur pouvait arriver directement sur des écrans de génération sans comprendre :

- quoi vérifier ;
- quelle page ouvrir ;
- quel type d’export choisir ;
- quelles limites garder en tête ;
- quels éléments relire avant transmission.

L’étape a donc ajouté des pages guides avant les outils existants.

---

## 2. Pages guides livrées

Les pages guides suivantes sont maintenant présentes :

- `/exporter/checklist`
- `/exporter/chronologie`
- `/exporter/note-synthese`
- `/exporter/dossier-avocat`
- `/exporter/courriers`
- `/exporter/resume-mois`
- `/exporter/pdf`

Ces pages ne remplacent pas les outils fonctionnels. Elles servent de points d’entrée pédagogiques.

---

## 3. Routes outils conservées

Les routes outils existantes restent accessibles :

- `/chronologie`
- `/note-synthese`
- `/dossier-avocat`
- `/courriers`
- `/resume-mois`
- `/export`

Principe appliqué :

- les pages `/exporter/...` expliquent et orientent ;
- les pages outils existantes continuent à générer, afficher ou préparer les documents.

Aucune route existante n’a été supprimée.

---

## 4. Navigation Exporter

Le menu Exporter contient désormais :

- Vue Exporter ;
- Checklist export ;
- Export chronologie ;
- Résumé du mois ;
- Courriers factuels ;
- Note de synthèse ;
- Dossier avocat ;
- Export PDF.

Cette organisation permet de distinguer :

- les contrôles avant export ;
- les guides d’entrée ;
- les outils de génération existants.

---

## 5. Checklist globale avant export

La page `/exporter/checklist` ajoute une relecture transversale autour de cinq blocs :

1. Dossier actif ;
2. Chronologie ;
3. Frais et pension ;
4. Documents et preuves ;
5. Relecture finale.

Elle rappelle que les documents générés doivent rester factuels, relus et vérifiés avant transmission.

---

## 6. Garde-fous respectés

Pendant cette étape :

- aucune migration Supabase n’a été ajoutée ;
- aucune table n’a été créée ;
- aucune route existante n’a été supprimée ;
- aucun outil PDF existant n’a été réécrit ;
- aucune promesse juridique n’a été ajoutée ;
- les textes restent sobres, factuels et prudents.

---

## 7. État produit après cette étape

Le parcours Exporter est maintenant cohérent :

1. l’utilisateur arrive sur `/exporter` ;
2. il choisit un type de document ou une checklist ;
3. il lit les contrôles à faire ;
4. il ouvre l’outil existant correspondant ;
5. il relit avant export ou transmission.

L’espace Exporter est donc stabilisé pour cette phase.

---

## 8. Prochaine étape recommandée

La prochaine étape produit recommandée n’est plus d’ajouter de nouvelles pages guides.

La priorité devient :

Réintégrer proprement la refonte UI actuellement en preview dans `main`.

Cette étape doit être traitée comme un chantier séparé, car la branche preview contient une refonte AppShell, des thèmes, des modifications visuelles et de nombreux fichiers.
