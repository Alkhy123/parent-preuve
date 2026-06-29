"use client";

// app/copilote/page.tsx
//
// Laboratoire du Copilote Agent.
//
// Tests disponibles :
// 1. Dry-run sécurisé : /api/agent/analyser-demande.
// 2. Agent Mistral général : /api/agent/repondre.
// 3. Agent Mistral général + résumé factuel du dossier.
// 4. Pré-remplissage Agent : /api/agent/pre-remplir.
//
// Aucune écriture métier.
// Aucune action automatique.
// Validation humaine obligatoire.

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AppButtonLink from "@/components/app/AppButtonLink";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";

import ConsentementIA from "@/components/ConsentementIA";

import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import { chargerResumeDossier, formaterResumeTexte } from "@/lib/resumeDossier";

import type { AgentReponseStructuree } from "@/lib/agent";

type ValidationAgentApi = {
  ok: boolean;
  erreur: string;
};

type ReponseAgentApi =
  | {
      ok: true;
      source?: "dry_run" | "mistral" | "garde_fou_local";
      validation?: ValidationAgentApi;
      reponse: AgentReponseStructuree;
    }
  | { erreur: string };

type PropositionFrais = {
  type: "frais";
  champs: {
    libelle: string | null;
    categorie: string;
    montant: number | null;
    date: string | null;
    enfant: string | null;
  };
  avertissements: string[];
};

type PropositionJournal = {
  type: "journal";
  champs: {
    titre: string | null;
    categorie: string;
    date: string | null;
    description: string | null;
    enfant: string | null;
  };
  avertissements: string[];
};

type PropositionPension = {
  type: "pension";
  champs: {
    mois: string | null;
    montant_du: number | null;
    montant_paye: number | null;
    date_paiement: string | null;
  };
  avertissements: string[];
};

type PropositionAucun = {
  type: "aucun";
  champs: null;
  avertissements: string[];
};

type PropositionPreRemplissage =
  | PropositionFrais
  | PropositionJournal
  | PropositionPension
  | PropositionAucun;

type ReponsePreRemplissageAgent = {
  version: string;
  resume: string;
  messages: string[];
  proposition: PropositionPreRemplissage;
  gardeFous: {
    conseilJuridiqueRefuse: boolean;
    ecritureAutomatiqueRefusee: true;
    validationHumaineRequise: true;
    enfantUuidInterdit: true;
  };
};

type ReponsePreRemplissageAgentApi =
  | {
      ok: true;
      source?: "mistral" | "garde_fou_local";
      validation?: ValidationAgentApi;
      reponse: ReponsePreRemplissageAgent;
    }
  | { erreur: string };

type ReponseQuestionDossierAgent = {
  version: string;
  resume: string;
  reponse: string;
  pointsAppui: string[];
  limites: string[];
  gardeFous: {
    conseilJuridiqueRefuse: boolean;
    strategieJudiciaireRefusee: boolean;
    redactionConclusionsRefusee: boolean;
    predictionDecisionRefusee: boolean;
    ecritureAutomatiqueRefusee: true;
    validationHumaineRequise: true;
  };
};

type ReponseQuestionDossierApi =
  | {
      ok: true;
      source?: "mistral" | "garde_fou_local" | "fallback";
      validation?: ValidationAgentApi;
      reponse: ReponseQuestionDossierAgent;
    }
  | { erreur: string };

type ModeReponse = "dry-run" | "mistral";

const EXEMPLES_DEMANDES = [
  "Je veux ajouter une facture de cantine",
  "Je veux noter un retard dans le journal",
  "Je veux classer une photo comme preuve",
  "Je veux préparer mon export PDF",
  "Rédige mes conclusions pour gagner devant le JAF",
];

const EXEMPLES_PREREMPLISSAGE = [
  "J'ai payé 45 € de cantine pour Léa le 12 mars",
  "Le père est arrivé avec 25 minutes de retard samedi",
  "J'ai acheté des vêtements pour 38,90 € hier",
  "J'ai payé 120 € d'orthophoniste pour mon fils",
  "Rédige mes conclusions pour gagner devant le JAF",
];

const EXEMPLES_QUESTION_DOSSIER = [
  "Où en est ma pension ?",
  "Quels frais semblent encore non remboursés ?",
  "Quels événements importants ressortent de mon journal ?",
  "Rédige mes conclusions pour gagner devant le JAF",
  "Quelle stratégie dois-je adopter contre mon ex ?",
  "Est-ce que le juge va me donner raison ?",
];

function libelleBooleen(valeur: boolean) {
  return valeur ? "Oui" : "Non";
}

function libelleMode(mode: ModeReponse | null) {
  if (mode === "mistral") return "Test Mistral expérimental";
  return "Dry-run sécurisé";
}

function valeurLisible(valeur: string | number | null | undefined) {
  if (valeur === null || valeur === undefined || valeur === "") {
    return "Non renseigné";
  }

  return String(valeur);
}

function libelleTypeProposition(type: PropositionPreRemplissage["type"]) {
  if (type === "frais") return "Frais";
  if (type === "journal") return "Journal";
  if (type === "pension") return "Pension";
  return "Aucun pré-remplissage";
}

function BlocProposition({
  titre,
  sousTitre,
  proposition,
  validation,
  source,
}: {
  titre: string;
  sousTitre: string;
  proposition: PropositionPreRemplissage | null;
  validation?: ValidationAgentApi | null;
  source?: string;
}) {
  if (!proposition) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-[#15233F]">{titre}</h3>
        <p className="mt-1 text-xs text-slate-500">{sousTitre}</p>
        <p className="mt-4 text-sm text-slate-500">Aucun résultat.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-[#15233F]">{titre}</h3>
          <p className="mt-1 text-xs text-slate-500">{sousTitre}</p>
        </div>

        <span className="inline-flex w-fit rounded-full border border-[#C2A24C]/40 bg-[#F8F6F1] px-3 py-1 text-xs font-medium text-[#15233F]">
          {libelleTypeProposition(proposition.type)}
        </span>
      </div>

      {source && (
        <p className="mt-3 text-xs text-slate-500">
          Source : <span className="font-medium">{source}</span>
        </p>
      )}

      {validation && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            validation.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {validation.ok
            ? "Validateur Agent passé."
            : validation.erreur ||
              "Réponse remplacée par une proposition sécurisée."}
        </div>
      )}

      {proposition.type === "frais" && (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Libellé</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.libelle)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Catégorie</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {proposition.champs.categorie}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Montant</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.montant)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Date</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.date)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Enfant</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.enfant)}
            </dd>
          </div>
        </dl>
      )}

      {proposition.type === "journal" && (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Titre</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.titre)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Catégorie</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {proposition.champs.categorie}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Date</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.date)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Enfant</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.enfant)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
            <dt className="text-xs text-slate-500">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.description)}
            </dd>
          </div>
        </dl>
      )}

      {proposition.type === "pension" && (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Mois</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.mois)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Montant dû</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.montant_du)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Montant payé</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.montant_paye)}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Date de réception</dt>
            <dd className="mt-1 font-medium text-[#15233F]">
              {valeurLisible(proposition.champs.date_paiement)}
            </dd>
          </div>
        </dl>
      )}

      {proposition.type === "aucun" && (
        <p className="mt-4 text-sm leading-6 text-[#5A6473]">
          Aucun pré-remplissage exploitable proposé.
        </p>
      )}

      {proposition.avertissements.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-900">
            Avertissements
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-800">
            {proposition.avertissements.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PageCopilote() {
  const [utilisateur, setUtilisateur] = useState<User | null>(null);
  const [verificationConnexion, setVerificationConnexion] = useState(true);

  const [message, setMessage] = useState("");
  const [inclureResume, setInclureResume] = useState(false);
  const [resumeEnvoye, setResumeEnvoye] = useState(false);

  const [reponse, setReponse] = useState<AgentReponseStructuree | null>(null);
  const [validation, setValidation] = useState<ValidationAgentApi | null>(null);
  const [modeReponse, setModeReponse] = useState<ModeReponse | null>(null);
  const [sourceApi, setSourceApi] = useState("");
  const [erreur, setErreur] = useState("");

  const [chargementDryRun, setChargementDryRun] = useState(false);
  const [chargementMistral, setChargementMistral] = useState(false);

  const [phrasePreRemplissage, setPhrasePreRemplissage] = useState("");
  const [reponsePreRemplissage, setReponsePreRemplissage] =
    useState<ReponsePreRemplissageAgent | null>(null);
  const [validationPreRemplissage, setValidationPreRemplissage] =
    useState<ValidationAgentApi | null>(null);
  const [sourcePreRemplissage, setSourcePreRemplissage] = useState("");
  const [erreurPreRemplissage, setErreurPreRemplissage] = useState("");
  const [chargementPreRemplissageAgent, setChargementPreRemplissageAgent] =
    useState(false);

  const [questionDossier, setQuestionDossier] = useState("");
  const [inclureResumeQuestion, setInclureResumeQuestion] = useState(true);
  const [reponseQuestionDossier, setReponseQuestionDossier] =
    useState<ReponseQuestionDossierAgent | null>(null);
  const [validationQuestionDossier, setValidationQuestionDossier] =
    useState<ValidationAgentApi | null>(null);
  const [sourceQuestionDossier, setSourceQuestionDossier] = useState("");
  const [erreurQuestionDossier, setErreurQuestionDossier] = useState("");
  const [chargementQuestionDossier, setChargementQuestionDossier] =
    useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUtilisateur(data.user);
      setVerificationConnexion(false);
    });

    const { data: ecouteur } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUtilisateur(session?.user ?? null);
        setVerificationConnexion(false);
      }
    );

    return () => ecouteur.subscription.unsubscribe();
  }, []);

  function viderResultats() {
    setReponse(null);
    setValidation(null);
    setModeReponse(null);
    setSourceApi("");
    setErreur("");
    setResumeEnvoye(false);
  }

  function viderResultatsPreRemplissage() {
    setReponsePreRemplissage(null);
    setValidationPreRemplissage(null);
    setSourcePreRemplissage("");
    setErreurPreRemplissage("");
  }

  function viderResultatsQuestionDossier() {
    setReponseQuestionDossier(null);
    setValidationQuestionDossier(null);
    setSourceQuestionDossier("");
    setErreurQuestionDossier("");
  }

  async function corpsMistralAvecResume(demande: string) {
    if (!inclureResume) {
      return { message: demande };
    }

    const resume = await chargerResumeDossier();
    const resumeTexte = formaterResumeTexte(resume);

    return {
      message: demande,
      resume: resumeTexte,
    };
  }

  async function analyserDemande(event: FormEvent) {
    event.preventDefault();

    const demande = message.trim();

    if (demande === "") return;

    setChargementDryRun(true);
    viderResultats();

    try {
      setResumeEnvoye(false);

      const resultat = await fetch("/api/agent/analyser-demande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ message: demande }),
      });

      const data = (await resultat.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }))) as ReponseAgentApi;

      if (!resultat.ok || "erreur" in data) {
        setErreur(
          "erreur" in data ? data.erreur : "Le copilote n'a pas pu répondre."
        );
        return;
      }

      setReponse(data.reponse);
      setValidation(data.validation ?? null);
      setModeReponse("dry-run");
      setSourceApi(data.source ?? "");
    } catch {
      setErreur("Connexion impossible avec le copilote.");
    } finally {
      setChargementDryRun(false);
    }
  }

  async function analyserAvecMistral() {
    const demande = message.trim();

    if (demande === "") return;

    setChargementMistral(true);
    viderResultats();

    try {
      const corps = await corpsMistralAvecResume(demande);
      setResumeEnvoye("resume" in corps);

      const resultat = await fetch("/api/agent/repondre", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify(corps),
      });

      const data = (await resultat.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }))) as ReponseAgentApi;

      if (!resultat.ok || "erreur" in data) {
        setErreur(
          "erreur" in data ? data.erreur : "Le copilote n'a pas pu répondre."
        );
        return;
      }

      setReponse(data.reponse);
      setValidation(data.validation ?? null);
      setModeReponse("mistral");
      setSourceApi(data.source ?? "");
    } catch {
      setErreur(
        inclureResume
          ? "Impossible de charger le résumé du dossier ou de contacter le copilote."
          : "Connexion impossible avec le copilote."
      );
    } finally {
      setChargementMistral(false);
    }
  }

  async function testerPreRemplissageAgent() {
    const phrase = phrasePreRemplissage.trim();

    if (phrase === "") return;

    setChargementPreRemplissageAgent(true);
    viderResultatsPreRemplissage();

    try {
      const resultat = await fetch("/api/agent/pre-remplir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ phrase }),
      });

      const data = (await resultat.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }))) as ReponsePreRemplissageAgentApi;

      if (!resultat.ok || "erreur" in data) {
        setErreurPreRemplissage(
          "erreur" in data
            ? data.erreur
            : "Le pré-remplissage Agent n'a pas pu répondre."
        );
        return;
      }

      setReponsePreRemplissage(data.reponse);
      setValidationPreRemplissage(data.validation ?? null);
      setSourcePreRemplissage(data.source ?? "");
    } catch {
      setErreurPreRemplissage(
        "Connexion impossible avec le pré-remplissage Agent."
      );
    } finally {
      setChargementPreRemplissageAgent(false);
    }
  }

  async function testerQuestionDossierAgent() {
    const demande = questionDossier.trim();

    if (demande === "") return;

    setChargementQuestionDossier(true);
    viderResultatsQuestionDossier();

    try {
      let resumeTexte = "";

      if (inclureResumeQuestion) {
        const resume = await chargerResumeDossier();
        resumeTexte = formaterResumeTexte(resume);
      }

      const resultat = await fetch("/api/agent/question-dossier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await enteteAuth()),
        },
        body: JSON.stringify({ question: demande, resume: resumeTexte }),
      });

      const data = (await resultat.json().catch(() => ({
        erreur: "Réponse serveur illisible.",
      }))) as ReponseQuestionDossierApi;

      if (!resultat.ok || "erreur" in data) {
        setErreurQuestionDossier(
          "erreur" in data
            ? data.erreur
            : "La question dossier Agent n'a pas pu répondre."
        );
        return;
      }

      setReponseQuestionDossier(data.reponse);
      setValidationQuestionDossier(data.validation ?? null);
      setSourceQuestionDossier(data.source ?? "");
    } catch {
      setErreurQuestionDossier(
        "Connexion impossible avec la question dossier Agent."
      );
    } finally {
      setChargementQuestionDossier(false);
    }
  }

  if (verificationConnexion) {
    return (
      <AppShell
        titre="Copilote"
        description="Tester les fonctions Agent du dossier avec validation humaine et garde-fous actifs."
      >
        <p className="text-sm text-slate-500">Chargement...</p>
      </AppShell>
    );
  }

  if (!utilisateur) {
    return (
      <AppShell
        titre="Copilote"
        description="Tester les fonctions Agent du dossier avec validation humaine et garde-fous actifs."
      >
        <div className="space-y-4">
          <AppNotice titre="Connexion requise">
            Vous devez etre connecte pour tester le copilote.
          </AppNotice>
          <AppButtonLink href="/connexion">Aller a la connexion</AppButtonLink>
        </div>
      </AppShell>
    );
  }

  const chargementGlobal = chargementDryRun || chargementMistral;
  const chargementPreRemplissage = chargementPreRemplissageAgent;

  return (
    <AppShell
      titre="Copilote"
      description="Tester les fonctions Agent du dossier avec validation humaine et garde-fous actifs."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/" variant="secondary">Retour accueil</AppButtonLink>
          <AppButtonLink href="/collecter" variant="secondary">Collecter</AppButtonLink>
        </div>
      }
    >
      <AppNotice titre="Garde-fous actifs">
        Aucune ecriture automatique. Validation humaine obligatoire. Pas de conseil juridique.
      </AppNotice>

      <section className="mt-6 rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
        <p className="mt-3 text-sm leading-6 text-[#5A6473]">
          Cette page permet de tester le dry-run, le Copilote Mistral, le
          resume factuel du dossier et le pre-remplissage Agent. Le
          pre-remplissage Agent est desormais la version utilisee par le bouton
          flottant.
        </p>

        <form onSubmit={analyserDemande} className="mt-6">
          <label
            htmlFor="demande-agent"
            className="block text-sm font-semibold text-[#15233F]"
          >
            Demande à analyser
          </label>

          <textarea
            id="demande-agent"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              viderResultats();
            }}
            rows={5}
            maxLength={1000}
            placeholder="Ex. : Je veux ajouter une facture de cantine"
            className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
          />

          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{message.length}/1000 caractères</span>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                viderResultats();
              }}
              className="text-[#8A6F2A] underline-offset-2 hover:underline"
            >
              Effacer
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <button
              type="submit"
              disabled={chargementGlobal || message.trim() === ""}
              className="inline-flex rounded-lg bg-[#15233F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0F1A2E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chargementDryRun ? "Analyse dry-run..." : "Analyser en dry-run"}
            </button>

            <div className="rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-3">
              <ConsentementIA
                fonctionnalite="agent"
                titre="Avant d'utiliser le Copilote Agent avec Mistral"
                descriptionTransmission="Le Copilote Agent peut envoyer à Mistral le texte que vous saisissez.
Si vous cochez l'option correspondante, il peut aussi envoyer un résumé factuel limité de votre dossier. Aucune pièce jointe, photo, document original ou donnée de santé ne doit être envoyé."
                descriptionResponsabilite="Le Copilote Agent sert à tester une aide d'organisation factuelle.
Il ne fournit aucun conseil juridique, ne rédige pas de conclusions judiciaires et ne déclenche aucune action automatique."
              >
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={analyserAvecMistral}
                    disabled={chargementGlobal || message.trim() === ""}
                    className="inline-flex rounded-lg border border-[#C2A24C]/60 bg-white px-4 py-2 text-sm font-medium text-[#15233F] transition hover:bg-[#F1E8D0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {chargementMistral
                      ? inclureResume
                        ? "Test Mistral avec résumé..."
                        : "Test Mistral..."
                      : "Tester avec Mistral"}
                  </button>

                  <label className="flex items-start gap-2 text-xs leading-5 text-[#5A6473]">
                    <input
                      type="checkbox"
                      checked={inclureResume}
                      onChange={(event) =>
                        setInclureResume(event.target.checked)
                      }
                      className="mt-1"
                    />

                    <span>
                      Inclure le résumé factuel du dossier pour ce test
                      Mistral.
                    </span>
                  </label>
                </div>
              </ConsentementIA>
            </div>
          </div>
        </form>

        <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
          <p className="text-sm font-semibold text-[#15233F]">
            Exemples de test
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXEMPLES_DEMANDES.map((exemple) => (
              <button
                key={exemple}
                type="button"
                onClick={() => {
                  setMessage(exemple);
                  viderResultats();
                }}
                className="rounded-full border border-[#C2A24C]/50 bg-white px-3 py-1 text-xs text-[#15233F] transition hover:bg-[#F1E8D0]"
              >
                {exemple}
              </button>
            ))}
          </div>
        </div>
      </section>

      {erreur && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">Erreur</h2>
          <p className="mt-2 text-sm text-red-800">{erreur}</p>
        </section>
      )}

      {reponse && (
        <section className="mt-6 rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
                Réponse structurée
              </p>

              <h2 className="mt-1 font-display text-2xl text-[#15233F]">
                Résultat du copilote
              </h2>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                {reponse.version}
              </span>

              <span className="inline-flex w-fit rounded-full border border-[#C2A24C]/40 bg-[#F8F6F1] px-3 py-1 text-xs font-medium text-[#15233F]">
                {libelleMode(modeReponse)}
              </span>

              {resumeEnvoye && (
                <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                  Résumé dossier inclus
                </span>
              )}
            </div>
          </div>

          {sourceApi && (
            <p className="mt-3 text-xs text-slate-500">
              Source API : <span className="font-medium">{sourceApi}</span>
            </p>
          )}

          {validation && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                validation.ok
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <h3
                className={`font-semibold ${
                  validation.ok ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                Validation de la réponse IA
              </h3>

              <p
                className={`mt-2 text-sm ${
                  validation.ok ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {validation.ok
                  ? "La réponse a passé le validateur Agent."
                  : validation.erreur ||
                    "La réponse IA a été remplacée par une réponse de sécurité."}
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
            <h3 className="font-semibold text-[#15233F]">Résumé</h3>
            <p className="mt-2 text-sm leading-6 text-[#5A6473]">
              {reponse.resume}
            </p>
          </div>

          {reponse.messages.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-[#15233F]">Messages</h3>

              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[#5A6473]">
                {reponse.messages.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {reponse.actionProposee && (
            <div className="mt-4 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-4">
              <h3 className="font-semibold text-[#15233F]">
                {reponse.actionProposee.titre}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#5A6473]">
                {reponse.actionProposee.raison}
              </p>

              {reponse.actionProposee.href && (
                <div className="mt-4">
                  <AppButtonLink href={reponse.actionProposee.href}>
                    Ouvrir la page proposee
                  </AppButtonLink>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-[#15233F]">Garde-fous</h3>

            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Conseil juridique refusé
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(reponse.gardeFous.conseilJuridiqueRefuse)}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Écriture automatique refusée
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponse.gardeFous.ecritureAutomatiqueRefusee
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Validation humaine requise
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponse.gardeFous.validationHumaineRequise
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
            Pré-remplissage Agent
          </p>

          <h2 className="mt-1 font-display text-2xl text-[#15233F]">
            Test du pré-remplissage Agent
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#5A6473]">
            Ce bloc permet de tester le pré-remplissage Agent utilisé par le
            bouton flottant. Aucune donnée n&apos;est créée automatiquement.
          </p>
        </div>

        <label
          htmlFor="phrase-pre-remplissage-agent"
          className="mt-5 block text-sm font-semibold text-[#15233F]"
        >
          Phrase à pré-remplir
        </label>

        <textarea
          id="phrase-pre-remplissage-agent"
          value={phrasePreRemplissage}
          onChange={(event) => {
            setPhrasePreRemplissage(event.target.value);
            viderResultatsPreRemplissage();
          }}
          rows={4}
          maxLength={500}
          placeholder="Ex. : J'ai payé 45 € de cantine pour Léa le 12 mars"
          className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
        />

        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{phrasePreRemplissage.length}/500 caractères</span>

          <button
            type="button"
            onClick={() => {
              setPhrasePreRemplissage("");
              viderResultatsPreRemplissage();
            }}
            className="text-[#8A6F2A] underline-offset-2 hover:underline"
          >
            Effacer
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-3">
          <ConsentementIA
            fonctionnalite="agent"
            titre="Avant de tester le pré-remplissage Agent"
            descriptionTransmission="Le test peut envoyer à Mistral la phrase que vous saisissez. Aucune pièce jointe, photo ou document original n'est envoyé."
            descriptionResponsabilite="Le pré-remplissage ne crée aucune donnée dans votre dossier. Il propose uniquement des champs à vérifier. La validation humaine reste obligatoire."
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={testerPreRemplissageAgent}
                disabled={
                  chargementPreRemplissage ||
                  phrasePreRemplissage.trim() === ""
                }
                className="inline-flex rounded-lg border border-[#C2A24C]/60 bg-white px-4 py-2 text-sm font-medium text-[#15233F] transition hover:bg-[#F1E8D0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chargementPreRemplissageAgent
                  ? "Test Agent..."
                  : "Tester l'Agent"}
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#5A6473]">
              Test expérimental : appel IA réel, quota IA consommé, aucune
              écriture automatique.
            </p>
          </ConsentementIA>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
          <p className="text-sm font-semibold text-[#15233F]">
            Exemples de pré-remplissage
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXEMPLES_PREREMPLISSAGE.map((exemple) => (
              <button
                key={exemple}
                type="button"
                onClick={() => {
                  setPhrasePreRemplissage(exemple);
                  viderResultatsPreRemplissage();
                }}
                className="rounded-full border border-[#C2A24C]/50 bg-white px-3 py-1 text-xs text-[#15233F] transition hover:bg-[#F1E8D0]"
              >
                {exemple}
              </button>
            ))}
          </div>
        </div>
      </section>

      {erreurPreRemplissage && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">
            Erreur pré-remplissage
          </h2>
          <p className="mt-2 text-sm text-red-800">
            {erreurPreRemplissage}
          </p>
        </section>
      )}

      {reponsePreRemplissage && (
        <section className="mt-6 rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
                Pré-remplissage Agent
              </p>

              <h2 className="mt-1 font-display text-2xl text-[#15233F]">
                Résultat du pré-remplissage
              </h2>
            </div>

            <span className="inline-flex w-fit rounded-full border border-[#C2A24C]/40 bg-[#F8F6F1] px-3 py-1 text-xs font-medium text-[#15233F]">
              {reponsePreRemplissage.version}
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
            <h3 className="font-semibold text-[#15233F]">Résumé Agent</h3>

            <p className="mt-2 text-sm leading-6 text-[#5A6473]">
              {reponsePreRemplissage.resume}
            </p>

            {reponsePreRemplissage.messages.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#5A6473]">
                {reponsePreRemplissage.messages.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5">
            <BlocProposition
              titre="Agent"
              sousTitre="/api/agent/pre-remplir"
              proposition={reponsePreRemplissage.proposition}
              validation={validationPreRemplissage}
              source={sourcePreRemplissage || "agent"}
            />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-[#15233F]">
              Garde-fous Agent
            </h3>

            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Conseil juridique refusé
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponsePreRemplissage.gardeFous.conseilJuridiqueRefuse
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Écriture automatique refusée
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponsePreRemplissage.gardeFous
                      .ecritureAutomatiqueRefusee
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Validation humaine requise
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponsePreRemplissage.gardeFous.validationHumaineRequise
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  UUID enfant interdit
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponsePreRemplissage.gardeFous.enfantUuidInterdit
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Ce test ne crée aucune donnée. Il affiche seulement la proposition
            structurée que l&apos;utilisateur devra vérifier avant toute validation.
          </p>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
            Question dossier Agent
          </p>

          <h2 className="mt-1 font-display text-2xl text-[#15233F]">
            Test de la question dossier Agent
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#5A6473]">
            Ce bloc teste la nouvelle route{" "}
            <span className="font-medium">/api/agent/question-dossier</span>{" "}
            avant tout branchement du bouton flottant. La réponse s&apos;appuie
            uniquement sur le résumé factuel du dossier. Aucune donnée n&apos;est
            modifiée.
          </p>
        </div>

        <label
          htmlFor="question-dossier-agent"
          className="mt-5 block text-sm font-semibold text-[#15233F]"
        >
          Question sur le dossier
        </label>

        <textarea
          id="question-dossier-agent"
          value={questionDossier}
          onChange={(event) => {
            setQuestionDossier(event.target.value);
            viderResultatsQuestionDossier();
          }}
          rows={4}
          maxLength={1000}
          placeholder="Ex. : Où en est ma pension ?"
          className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6 outline-none transition focus:border-[#C2A24C] focus:ring-2 focus:ring-[#C2A24C]/30"
        />

        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{questionDossier.length}/1000 caractères</span>

          <button
            type="button"
            onClick={() => {
              setQuestionDossier("");
              viderResultatsQuestionDossier();
            }}
            className="text-[#8A6F2A] underline-offset-2 hover:underline"
          >
            Effacer
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[#C2A24C]/40 bg-[#F8F6F1] p-3">
          <ConsentementIA
            fonctionnalite="agent"
            titre="Avant de tester la question dossier Agent"
            descriptionTransmission="Le test peut envoyer à Mistral votre question et, si l'option est cochée, un résumé factuel limité de votre dossier. Aucune pièce jointe, photo, document original ou donnée de santé n'est envoyé."
            descriptionResponsabilite="La question dossier Agent répond uniquement à partir du résumé factuel. Elle ne fournit aucun conseil juridique, ne rédige pas de conclusions judiciaires et ne déclenche aucune action automatique."
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={testerQuestionDossierAgent}
                disabled={
                  chargementQuestionDossier ||
                  questionDossier.trim() === ""
                }
                className="inline-flex rounded-lg border border-[#C2A24C]/60 bg-white px-4 py-2 text-sm font-medium text-[#15233F] transition hover:bg-[#F1E8D0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chargementQuestionDossier
                  ? "Test question dossier..."
                  : "Tester la question dossier"}
              </button>

              <label className="flex items-start gap-2 text-xs leading-5 text-[#5A6473]">
                <input
                  type="checkbox"
                  checked={inclureResumeQuestion}
                  onChange={(event) =>
                    setInclureResumeQuestion(event.target.checked)
                  }
                  className="mt-1"
                />

                <span>
                  Inclure le résumé factuel du dossier pour ce test.
                </span>
              </label>

              <p className="text-xs leading-5 text-[#5A6473]">
                Test expérimental : appel IA réel, quota IA consommé, aucune
                écriture automatique.
              </p>
            </div>
          </ConsentementIA>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
          <p className="text-sm font-semibold text-[#15233F]">
            Exemples de question
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXEMPLES_QUESTION_DOSSIER.map((exemple) => (
              <button
                key={exemple}
                type="button"
                onClick={() => {
                  setQuestionDossier(exemple);
                  viderResultatsQuestionDossier();
                }}
                className="rounded-full border border-[#C2A24C]/50 bg-white px-3 py-1 text-xs text-[#15233F] transition hover:bg-[#F1E8D0]"
              >
                {exemple}
              </button>
            ))}
          </div>
        </div>
      </section>

      {erreurQuestionDossier && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">
            Erreur question dossier
          </h2>
          <p className="mt-2 text-sm text-red-800">{erreurQuestionDossier}</p>
        </section>
      )}

      {reponseQuestionDossier && (
        <section className="mt-6 rounded-2xl border border-[#E1D7C4] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6F2A]">
                Question dossier Agent
              </p>

              <h2 className="mt-1 font-display text-2xl text-[#15233F]">
                Résultat de la question dossier
              </h2>
            </div>

            <span className="inline-flex w-fit rounded-full border border-[#C2A24C]/40 bg-[#F8F6F1] px-3 py-1 text-xs font-medium text-[#15233F]">
              {reponseQuestionDossier.version}
            </span>
          </div>

          {sourceQuestionDossier && (
            <p className="mt-3 text-xs text-slate-500">
              Source API :{" "}
              <span className="font-medium">{sourceQuestionDossier}</span>
            </p>
          )}

          {validationQuestionDossier && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                validationQuestionDossier.ok
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <h3
                className={`font-semibold ${
                  validationQuestionDossier.ok
                    ? "text-emerald-900"
                    : "text-amber-900"
                }`}
              >
                Validation de la réponse IA
              </h3>

              <p
                className={`mt-2 text-sm ${
                  validationQuestionDossier.ok
                    ? "text-emerald-800"
                    : "text-amber-800"
                }`}
              >
                {validationQuestionDossier.ok
                  ? "La réponse a passé le validateur Agent."
                  : validationQuestionDossier.erreur ||
                    "La réponse IA a été remplacée par une réponse de sécurité."}
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-[#F8F6F1] p-4">
            <h3 className="font-semibold text-[#15233F]">Résumé</h3>
            <p className="mt-2 text-sm leading-6 text-[#5A6473]">
              {reponseQuestionDossier.resume}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-[#15233F]">Réponse</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5A6473]">
              {reponseQuestionDossier.reponse}
            </p>
          </div>

          {reponseQuestionDossier.pointsAppui.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-[#15233F]">Points d&apos;appui</h3>

              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[#5A6473]">
                {reponseQuestionDossier.pointsAppui.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {reponseQuestionDossier.limites.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900">Limites</h3>

              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-800">
                {reponseQuestionDossier.limites.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-[#15233F]">Garde-fous</h3>

            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Conseil juridique refusé
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponseQuestionDossier.gardeFous.conseilJuridiqueRefuse
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Stratégie judiciaire refusée
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponseQuestionDossier.gardeFous.strategieJudiciaireRefusee
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Rédaction conclusions refusée
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponseQuestionDossier.gardeFous.redactionConclusionsRefusee
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Prédiction décision refusée
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponseQuestionDossier.gardeFous.predictionDecisionRefusee
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Écriture automatique refusée
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponseQuestionDossier.gardeFous.ecritureAutomatiqueRefusee
                  )}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">
                  Validation humaine requise
                </dt>
                <dd className="mt-1 font-semibold text-[#15233F]">
                  {libelleBooleen(
                    reponseQuestionDossier.gardeFous.validationHumaineRequise
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Ce test ne crée aucune donnée. La réponse reste informative et doit
            être vérifiée par l&apos;utilisateur.
          </p>
        </section>
      )}
    </AppShell>
  );
}
