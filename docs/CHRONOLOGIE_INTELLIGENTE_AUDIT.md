# Parent Preuve — Audit Chronologie intelligente

Date : 28 juin 2026  
Statut : audit produit et UX, sans modification de base de données.

---

## 1. Objectif du chantier

La chronologie doit devenir le cœur de lecture du dossier Parent Preuve.

Elle doit permettre à l’utilisateur de comprendre rapidement :

- les faits saisis ;
- les frais enregistrés ;
- les paiements ou écarts de pension ;
- les documents classés ;
- les preuves photo conservées ;
- les règles de garde connues ;
- les éléments à dater ou à vérifier.

La chronologie ne doit pas devenir un nouveau module de saisie lourd. Elle doit rester un écran de lecture, de contrôle et de préparation à l’export.

---

## 2. État actuel constaté

La page `/chronologie` existe déjà.

Elle charge actuellement plusieurs sources :

- `events` ;
- `expenses` ;
- `pension_payments` ;
- `preuves_photo` ;
- `documents` ;
- `garde_regles`.

Elle utilise une logique d’agrégation en lecture seule avec :

- `fusionnerChronologie` ;
- `collecterTimeline` ;
- `TimelineDossier`.

La timeline ne dispose pas d’une table dédiée et ne crée aucune donnée.

---

## 3. Décision technique pour la V1

Pour la première étape du chantier, il ne faut pas modifier la base de données.

Décision :

```text
UX d’abord.
Base de données ensuite seulement si un besoin métier clair apparaît.
```

La V1 doit donc :

- améliorer la compréhension de la page ;
- expliquer les sources affichées ;
- rappeler le rôle de la chronologie dans le parcours Collecter → Organiser → Exporter ;
- préparer l’arrivée future des brouillons validés ;
- conserver les exports PDF / CSV existants ;
- ne pas modifier les règles de cloisonnement par procédure.

---

## 4. Ce que la chronologie doit expliquer à l’utilisateur

La page doit indiquer clairement que la chronologie rassemble :

- les faits du journal ;
- les frais ;
- les pensions ;
- les documents ;
- les preuves photo ;
- les règles de garde.

Elle doit aussi préciser que :

- les brouillons locaux ne sont pas encore intégrés automatiquement ;
- un brouillon doit être relu, ouvert dans le bon module, puis enregistré manuellement ;
- les exports restent factuels ;
- Parent Preuve ne garantit aucune recevabilité ni aucun résultat.

---

## 5. Points de vigilance

Ne pas employer les formulations suivantes :

- preuve recevable ;
- preuve certifiée ;
- preuve irréfutable ;
- équivalent commissaire de justice ;
- dossier gagnant ;
- stratégie judiciaire ;
- faute de l’autre parent.

Formulations à privilégier :

- trace claire ;
- élément daté ;
- dossier factuel ;
- chronologie ;
- élément à vérifier ;
- export de travail ;
- préparation d’un échange avec un professionnel.

---

## 6. Étape suivante recommandée

Après ce premier socle UX, la suite logique sera :

1. améliorer les compteurs par source ;
2. ajouter un résumé automatique non IA de la chronologie ;
3. renforcer les états “à dater / à vérifier” ;
4. préparer l’intégration contrôlée des brouillons validés ;
5. connecter plus finement la chronologie aux exports avancés.
