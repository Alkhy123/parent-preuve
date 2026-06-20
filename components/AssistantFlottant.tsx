"use client";

// components/AssistantFlottant.tsx
//
// Assistant flottant (LECTURE SEULE cote base), monte une fois dans app/layout.tsx.
// Bouton DEPLACABLE (voir lib/useDeplacable). Trois usages : s'orienter, poser une
// question sur l'etat du dossier, et PRE-REMPLIR une saisie (frais/journal).
// L'IA n'ecrit jamais en base : le pre-remplissage est seulement propose, puis
// l'utilisateur valide lui-meme a l'ecran /frais ou /journal.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import { chargerResumeDossier, formaterResumeTexte } from "@/lib/resumeDossier";
import { DESTINATIONS } from "@/lib/destinationsAssistant";
import { useDeplacable } from "@/lib/useDeplacable";
import { CLE_SESSION_PREREMPLISSAGE } from "@/lib/preRemplissage";

const ROUTES_MASQUEES = [
  "/connexion",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/mentions-legales",
  "/confidentialite",
];

const TAILLE = 48; // h-12 w-12

export default function AssistantFlottant() {
  const pathname = usePathname();
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [connecte, setConnecte] = useState<boolean | null>(null);
  const { pos, onPointerDown, consommerDeplacement, ancrage } = useDeplacable(
    "pos-assistant",
    "bas-gauche",
    TAILLE
  );

  const [resume, setResume] = useState("");
  const [resumePret, setResumePret] = useState(false);

  const [phrase, setPhrase] = useState("");
  const [destination, setDestination] = useState<{ href: string; label: string } | null>(null);
  const [raison, setRaison] = useState("");
  const [pasDeDestination, setPasDeDestination] = useState(false);
  const [enCoursAig, setEnCoursAig] = useState(false);
  const [erreurAig, setErreurAig] = useState("");

  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreurQuestion, setErreurQuestion] = useState("");

  // Pré-remplissage : phrase libre -> proposition de champs, transmise par
  // sessionStorage puis ouverte sur /frais ou /journal pour validation humaine.
  const [saisie, setSaisie] = useState("");
  const [enCoursPre, setEnCoursPre] = useState(false);
  const [erreurPre, setErreurPre] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: ecouteur } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnecte(!!session?.user)
    );
    return () => ecouteur.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  useEffect(() => {
    if (!ouvert) return;
    let annule = false;
    setResumePret(false);
    setResume("");
    chargerResumeDossier()
      .then((r) => {
        if (!annule) {
          setResume(formaterResumeTexte(r));
          setResumePret(true);
        }
      })
      .catch(() => {
        if (!annule) setResumePret(false);
      });
    return () => {
      annule = true;
    };
  }, [ouvert]);

  if (!connecte || ROUTES_MASQUEES.includes(pathname) || !pos) {
    return null;
  }

  async function aiguiller() {
    if (phrase.trim() === "") return;
    setEnCoursAig(true);
    setDestination(null);
    setRaison("");
    setPasDeDestination(false);
    setErreurAig("");
    try {
      const r = await fetch("/api/assistant/aiguiller", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ phrase }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErreurAig(data.erreur ?? "Erreur inconnue.");
      } else {
        setRaison(data.raison ?? "");
        const d = DESTINATIONS.find((x) => x.cle === data.cle);
        if (d) setDestination({ href: d.href, label: d.label });
        else setPasDeDestination(true);
      }
    } catch {
      setErreurAig("Connexion impossible.");
    } finally {
      setEnCoursAig(false);
    }
  }

  async function poser() {
    if (question.trim() === "" || !resumePret) return;
    setEnCours(true);
    setReponse("");
    setErreurQuestion("");
    try {
      const r = await fetch("/api/assistant/repondre", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ question, resume }),
      });
      const data = await r.json();
      if (!r.ok) setErreurQuestion(data.erreur ?? "Erreur inconnue.");
      else setReponse(data.reponse ?? "");
    } catch {
      setErreurQuestion("Connexion impossible.");
    } finally {
      setEnCours(false);
    }
  }

  // Demande une proposition de pré-remplissage, la dépose dans sessionStorage
  // (jamais dans l'URL), puis ouvre l'écran de saisie correspondant. L'IA n'écrit
  // rien : c'est l'utilisateur qui validera via le bouton « Ajouter » de l'écran.
  async function preRemplir() {
    if (saisie.trim() === "") return;
    setEnCoursPre(true);
    setErreurPre("");
    try {
      const r = await fetch("/api/assistant/pre-remplir", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ phrase: saisie }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErreurPre(data.erreur ?? "Erreur inconnue.");
        return;
      }
      const proposition = data.proposition;
      if (!proposition || proposition.type === "aucun") {
        setErreurPre(
          "Aucune saisie reconnue. Reformulez en précisant une dépense (avec un montant) ou un fait à noter."
        );
        return;
      }
      // Destination tirée de la liste fermée (jamais fabriquée).
      const dest = DESTINATIONS.find((d) => d.cle === proposition.type);
      if (!dest) {
        setErreurPre("Type de saisie non pris en charge.");
        return;
      }
      try {
        sessionStorage.setItem(
          CLE_SESSION_PREREMPLISSAGE,
          JSON.stringify(proposition)
        );
      } catch {
        setErreurPre("Stockage local indisponible : impossible de transmettre la proposition.");
        return;
      }
      setSaisie("");
      setOuvert(false);
      router.push(dest.href);
    } catch {
      setErreurPre("Connexion impossible.");
    } finally {
      setEnCoursPre(false);
    }
  }

  const a = ancrage();
  const classesPanneau = [
    "absolute w-80 max-w-[calc(100vw-2rem)] max-h-[60vh] overflow-y-auto rounded-2xl border border-[#C2A24C]/40 bg-white p-4 shadow-xl",
    a.vertical === "haut" ? "bottom-full mb-3" : "top-full mt-3",
    a.horizontal === "droite" ? "right-0" : "left-0",
  ].join(" ");

  return (
    <>
      {ouvert && (
        <button
          type="button"
          aria-label="Fermer le copilote"
          onClick={() => setOuvert(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      <div style={{ left: pos.x, top: pos.y }} className="fixed z-50 h-12 w-12">
        {ouvert && (
          <div className={classesPanneau}>
            <h2 className="font-display text-lg text-[#15233F]">Copilote Parent Preuve</h2>
            <p className="mt-1 text-xs text-[#5A6473]">
            Il vous aide à organiser votre dossier factuel. Il propose, vous validez :
            rien n'est enregistré sans votre action.
            </p>

            <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-[#C2A24C]">
              Que voulez-vous faire ?
            </h3>
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Ex. : noter un retard"
              className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
            <button
              onClick={aiguiller}
              disabled={enCoursAig || phrase.trim() === ""}
              className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm text-[#F8F6F1] disabled:opacity-50"
            >
              {enCoursAig ? "…" : "M'orienter"}
            </button>
            {erreurAig && <p className="mt-2 text-sm text-[#9B2C2C]">{erreurAig}</p>}
            {raison && <p className="mt-2 text-sm text-[#5A6473]">{raison}</p>}
            {destination && (
              <Link
                href={destination.href}
                onClick={() => setOuvert(false)}
                className="mt-2 inline-block rounded-lg border border-[#C2A24C] bg-[#F8F6F1] px-3 py-2 text-sm font-medium text-[#15233F]"
              >
                Aller sur « {destination.label} » →
              </Link>
            )}
            {pasDeDestination && (
              <p className="mt-2 text-sm text-[#8A5A12]">
                Aucune page ne correspond clairement. Reformulez ?
              </p>
            )}

            <h3 className="mt-5 text-xs font-medium uppercase tracking-wide text-[#C2A24C]">
              Pré-remplir une saisie
            </h3>
            <input
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Ex. : payé 45 € de cantine pour Léa le 12 mars"
              className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
            <p className="mt-1 text-xs text-[#5A6473]">
              Votre saisie est envoyée à notre prestataire d'IA hébergé dans l'UE
                pour proposer un pré-remplissage. Aucune donnée n'est enregistrée à
                cette étape : rien n'est ajouté à votre dossier tant que vous ne
                validez pas vous-même à l'écran.
            </p>
            <button
              onClick={preRemplir}
              disabled={enCoursPre || saisie.trim() === ""}
              className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm text-[#F8F6F1] disabled:opacity-50"
            >
              {enCoursPre ? "…" : "Pré-remplir"}
            </button>
            {erreurPre && <p className="mt-2 text-sm text-[#9B2C2C]">{erreurPre}</p>}

            <h3 className="mt-5 text-xs font-medium uppercase tracking-wide text-[#C2A24C]">
              Poser une question
            </h3>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex. : où en est ma pension ?"
              rows={2}
              className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
            <button
              onClick={poser}
              disabled={enCours || question.trim() === "" || !resumePret}
              className="mt-2 rounded-lg bg-[#15233F] px-3 py-2 text-sm text-[#F8F6F1] disabled:opacity-50"
            >
              {enCours ? "…" : resumePret ? "Demander" : "Chargement…"}
            </button>
            {erreurQuestion && <p className="mt-2 text-sm text-[#9B2C2C]">{erreurQuestion}</p>}
            {reponse && (
              <div className="mt-2 whitespace-pre-wrap rounded-lg border border-[#C2A24C]/40 bg-[#F8F6F1] p-3 text-sm">
                {reponse}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onPointerDown={onPointerDown}
          onClick={() => {
            if (consommerDeplacement()) return;
            setOuvert((v) => !v);
          }}
          aria-expanded={ouvert}
          aria-label={ouvert ? "Fermer l'assistant" : "Ouvrir l'assistant"}
          className="flex h-12 w-12 touch-none items-center justify-center rounded-full bg-[#15233F] text-[#ECE7DC] shadow-lg transition hover:bg-[#1d3056] focus:outline-none focus:ring-2 focus:ring-[#C2A24C] focus:ring-offset-2"
        >
          <span aria-hidden="true" className="text-xl">
            {ouvert ? "×" : "?"}
          </span>
        </button>
      </div>
    </>
  );
}