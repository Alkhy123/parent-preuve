"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppButtonLink from "@/components/app/AppButtonLink";
import AppNotice from "@/components/app/AppNotice";
import AppShell from "@/components/app/AppShell";
import {
  construirePreRemplissageCollecte,
  type BrouillonCollectePourPreRemplissage,
} from "@/lib/collecteRapidePreRemplissage";
import { CLE_SESSION_PREREMPLISSAGE } from "@/lib/preRemplissage";

type TypeCollecte = {
  id: string;
  href: string;
  titre: string;
  priorite: string;
  description: string;
  exemples: string[];
};

type BrouillonLocal = {
  id: string;
  type: string;
  href: string;
  date: string;
  titre: string;
  enfant: string;
  contenu: string;
  creeLe: string;
};

const CLE_BROUILLONS = "parent-preuve:brouillons-collecte-rapide";

const TYPES_COLLECTE: TypeCollecte[] = [
  {
    id: "fait",
    href: "/journal",
    titre: "Fait ou événement",
    priorite: "Prioritaire",
    description:
      "Noter rapidement ce qui vient de se passer : retard, absence, conflit, information importante ou difficulté.",
    exemples: ["Retard", "Absence", "Incident", "Information importante"],
  },
  {
    id: "preuve",
    href: "/preuves",
    titre: "Preuve photo",
    priorite: "Prioritaire",
    description:
      "Ajouter une photo utile au dossier avec un contexte factuel et une date.",
    exemples: ["Photo du lieu", "Justificatif visuel", "Document photographié"],
  },
  {
    id: "document",
    href: "/documents",
    titre: "Document",
    priorite: "Prioritaire",
    description:
      "Importer un jugement, une ordonnance, une facture, un certificat, un courrier ou une pièce utile.",
    exemples: ["Jugement", "Facture", "Courrier", "Certificat"],
  },
  {
    id: "frais",
    href: "/frais",
    titre: "Frais",
    priorite: "Financier",
    description:
      "Ajouter une dépense liée à l'enfant et conserver le justificatif associé.",
    exemples: ["Santé", "École", "Transport", "Activité"],
  },
  {
    id: "pension",
    href: "/pension",
    titre: "Pension",
    priorite: "Financier",
    description:
      "Ajouter un paiement reçu, un paiement partiel, un retard ou un solde restant à suivre.",
    exemples: ["Paiement reçu", "Paiement partiel", "Retard", "Solde"],
  },
  {
    id: "echeance",
    href: "/calendrier",
    titre: "Échéance",
    priorite: "Organisation",
    description:
      "Ajouter une date importante : audience, rendez-vous, garde, remise, rappel ou limite de réponse.",
    exemples: ["Audience", "Rendez-vous", "Remise", "Rappel"],
  },
];

const PRINCIPES = [
  "Saisir vite, même si tout n'est pas encore complet.",
  "Rester factuel : qui, quoi, quand, où.",
  "Ajouter les détails plus tard dans Organiser.",
  "Éviter les formulations agressives ou les conclusions juridiques.",
];

function dateDuJour() {
  return new Date().toISOString().slice(0, 10);
}

function genererId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function lireBrouillonsLocaux() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const brut = window.localStorage.getItem(CLE_BROUILLONS);

    if (!brut) {
      return [];
    }

    const valeur = JSON.parse(brut);

    if (!Array.isArray(valeur)) {
      return [];
    }

    return valeur as BrouillonLocal[];
  } catch {
    return [];
  }
}

function enregistrerBrouillonsLocaux(brouillons: BrouillonLocal[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CLE_BROUILLONS, JSON.stringify(brouillons));
}

export default function CollecteRapidePage() {
  const router = useRouter();

  const [typeSelectionne, setTypeSelectionne] = useState(TYPES_COLLECTE[0]);
  const [date, setDate] = useState(dateDuJour());
  const [titre, setTitre] = useState("");
  const [enfant, setEnfant] = useState("");
  const [lieu, setLieu] = useState("");
  const [description, setDescription] = useState("");
  const [piece, setPiece] = useState("");
  const [copie, setCopie] = useState(false);
  const [brouillonEnregistre, setBrouillonEnregistre] = useState(false);
  const [brouillons, setBrouillons] = useState<BrouillonLocal[]>([]);

  const brouillon = useMemo(() => {
    return [
      `Type : ${typeSelectionne.titre}`,
      `Date : ${date || "à compléter"}`,
      `Titre : ${titre || "à compléter"}`,
      `Enfant concerné : ${enfant || "à compléter"}`,
      `Lieu : ${lieu || "à compléter"}`,
      `Pièce associée : ${piece || "aucune pièce indiquée"}`,
      "",
      "Description factuelle :",
      description || "à compléter",
    ].join("\n");
  }, [date, description, enfant, lieu, piece, titre, typeSelectionne]);

  const actionModule = construirePreRemplissageCollecte({
    type: typeSelectionne.titre,
    href: typeSelectionne.href,
    date,
    titre,
    enfant,
    contenu: brouillon,
  });

  async function copierTexte(texte: string) {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  }

  function ouvrirModuleAvecPreRemplissage(
    source: BrouillonCollectePourPreRemplissage,
  ) {
    const resultat = construirePreRemplissageCollecte(source);

    try {
      if (resultat.proposition) {
        window.sessionStorage.setItem(
          CLE_SESSION_PREREMPLISSAGE,
          JSON.stringify(resultat.proposition),
        );
      }
    } catch {
      // sessionStorage indisponible : on ouvre simplement le module.
    }

    router.push(resultat.href);
  }

  function chargerBrouillons() {
    setBrouillons(lireBrouillonsLocaux());
  }

  function enregistrerBrouillon() {
    const nouveauBrouillon: BrouillonLocal = {
      id: genererId(),
      type: typeSelectionne.titre,
      href: typeSelectionne.href,
      date,
      titre: titre || "Brouillon sans titre",
      enfant,
      contenu: brouillon,
      creeLe: new Date().toISOString(),
    };

    const brouillonsExistants = lireBrouillonsLocaux();
    const brouillonsMisAJour = [nouveauBrouillon, ...brouillonsExistants].slice(
      0,
      10,
    );

    enregistrerBrouillonsLocaux(brouillonsMisAJour);
    setBrouillons(brouillonsMisAJour);
    setBrouillonEnregistre(true);
    window.setTimeout(() => setBrouillonEnregistre(false), 2500);
  }

  function supprimerBrouillon(id: string) {
    const brouillonsMisAJour = brouillons.filter(
      (brouillonLocal) => brouillonLocal.id !== id,
    );

    enregistrerBrouillonsLocaux(brouillonsMisAJour);
    setBrouillons(brouillonsMisAJour);
  }

  function viderFormulaire() {
    setDate(dateDuJour());
    setTitre("");
    setEnfant("");
    setLieu("");
    setDescription("");
    setPiece("");
    setCopie(false);
    setBrouillonEnregistre(false);
  }

  return (
    <AppShell
      titre="Collecte rapide"
      description="Creer un brouillon factuel en moins d une minute avant de l envoyer vers le bon module."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <AppButtonLink href="/collecter" variant="secondary">Retour Collecter</AppButtonLink>
          <AppButtonLink href="/organiser/brouillons" variant="secondary">Brouillons locaux</AppButtonLink>
        </div>
      }
    >
      <section className="rounded-3xl border border-[#C2A24C]/30 bg-[#C2A24C]/10 p-5">
        <p className="text-sm font-semibold text-[#8A5A12]">
          Objectif : préparer une saisie utile en moins de 30 secondes.
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Cette page sert de brouillon guidé. Pour les faits, frais et pensions,
          Parent Preuve peut maintenant préremplir le module correspondant.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
            1. Choisir le type
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
            Que voulez-vous collecter ?
          </h2>

          <div className="mt-5 grid gap-3">
            {TYPES_COLLECTE.map((type) => {
              const actif = type.id === typeSelectionne.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTypeSelectionne(type)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    actif
                      ? "border-[#C2A24C] bg-[#C2A24C]/10"
                      : "border-slate-200 bg-slate-50 hover:border-[#C2A24C]/70 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-[#15233F]">
                      {type.titre}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#8A5A12]">
                      {type.priorite}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
            2. Noter l'essentiel
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
            Brouillon de collecte
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Enfant concerné
              <input
                value={enfant}
                onChange={(e) => setEnfant(e.target.value)}
                placeholder="Nom ou prénom"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F] md:col-span-2">
              Titre court
              <input
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex. Retard à la remise, facture médicale, paiement partiel..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Lieu
              <input
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                placeholder="Lieu ou contexte"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F]">
              Pièce associée
              <input
                value={piece}
                onChange={(e) => setPiece(e.target.value)}
                placeholder="Photo, facture, capture, document..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#15233F] md:col-span-2">
              Description factuelle
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Décrivez uniquement les faits : qui, quoi, quand, où. Évitez les accusations ou conclusions juridiques."
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#C2A24C]"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={viderFormulaire}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
            >
              Vider le formulaire
            </button>

            <button
              type="button"
              onClick={enregistrerBrouillon}
              className="rounded-full bg-[#15233F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
            >
              {brouillonEnregistre
                ? "Brouillon enregistré"
                : "Enregistrer localement"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
            3. Résumé prêt à utiliser
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
            Brouillon généré
          </h2>

          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            {brouillon}
          </pre>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => copierTexte(brouillon)}
              className="rounded-full bg-[#15233F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F1A30]"
            >
              {copie ? "Brouillon copié" : "Copier le brouillon"}
            </button>

            <button
              type="button"
              onClick={() =>
                ouvrirModuleAvecPreRemplissage({
                  type: typeSelectionne.titre,
                  href: typeSelectionne.href,
                  date,
                  titre,
                  enfant,
                  contenu: brouillon,
                })
              }
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
            >
              {actionModule.labelAction}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#15233F]">
            Méthode de collecte
          </h2>

          <div className="mt-4 grid gap-3">
            {PRINCIPES.map((principe) => (
              <div
                key={principe}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"
              >
                {principe}
              </div>
            ))}
          </div>

          <AppNotice titre="Important">
            Le preremplissage ne cree rien automatiquement. Vous devez
            verifier les champs puis enregistrer vous-meme dans le module.
          </AppNotice>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#C2A24C]">
              Brouillons locaux
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#15233F]">
              Derniers brouillons préparés
            </h2>
          </div>

          <button
            type="button"
            onClick={chargerBrouillons}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70 hover:bg-white"
          >
            Charger les brouillons locaux
          </button>
        </div>

        {brouillons.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Aucun brouillon chargé pour le moment. Les brouillons locaux restent
            sur ce navigateur et ne sont pas synchronisés entre appareils.
          </p>
        ) : (
          <div className="mt-5 grid gap-4">
            {brouillons.map((brouillonLocal) => {
              const actionBrouillon = construirePreRemplissageCollecte({
                type: brouillonLocal.type,
                href: brouillonLocal.href,
                date: brouillonLocal.date,
                titre: brouillonLocal.titre,
                enfant: brouillonLocal.enfant,
                contenu: brouillonLocal.contenu,
              });

              return (
                <article
                  key={brouillonLocal.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#C2A24C]">
                        {brouillonLocal.type}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-[#15233F]">
                        {brouillonLocal.titre}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Date : {brouillonLocal.date || "à compléter"} · Enfant :{" "}
                        {brouillonLocal.enfant || "à compléter"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copierTexte(brouillonLocal.contenu)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#15233F] transition hover:border-[#C2A24C]/70"
                      >
                        Copier
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          ouvrirModuleAvecPreRemplissage({
                            type: brouillonLocal.type,
                            href: brouillonLocal.href,
                            date: brouillonLocal.date,
                            titre: brouillonLocal.titre,
                            enfant: brouillonLocal.enfant,
                            contenu: brouillonLocal.contenu,
                          })
                        }
                        className="rounded-full bg-[#15233F] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0F1A30]"
                      >
                        {actionBrouillon.labelAction}
                      </button>

                      <button
                        type="button"
                        onClick={() => supprimerBrouillon(brouillonLocal.id)}
                        className="rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
                    {brouillonLocal.contenu}
                  </pre>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-[#15233F]">
          Après la collecte
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Une fois l'élément enregistré dans le bon module, vérifiez-le dans
          l'espace Organiser pour le rattacher au bon enfant, au bon dossier, à
          la bonne procédure et aux pièces utiles.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <AppButtonLink href="/organiser">Aller dans Organiser</AppButtonLink>
          <AppButtonLink href="/organiser/brouillons" variant="secondary">Voir les brouillons locaux</AppButtonLink>
          <AppButtonLink href="/rattacher" variant="secondary">Voir les elements a rattacher</AppButtonLink>
        </div>
      </section>
    </AppShell>
  );
}
