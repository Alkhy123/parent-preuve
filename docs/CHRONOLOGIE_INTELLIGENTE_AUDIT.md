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
