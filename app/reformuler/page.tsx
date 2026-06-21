"use client";
import Link from "next/link"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // ⚠️ adapte si tes autres pages importent autrement
import PageHeader from "@/components/PageHeader";
import { enteteAuth } from "@/lib/enteteAuth";

<p className="text-sm">
  <Link href="/mentions-legales" className="text-[#15233F] underline">
    En savoir plus sur le traitement de vos données
  </Link>
</p>

export default function ReformulerPage() {
  // null = on ne sait pas encore (chargement) ; true/false ensuite
  const [consentement, setConsentement] = useState<boolean | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const [texte, setTexte] = useState("");
  const [reformule, setReformule] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState(false);

  // 1. Au chargement : ce parent a-t-il déjà donné son accord ?
  useEffect(() => {
    async function verifier() {
      const { data, error } = await supabase
        .from("consentements_ia")
        .select("id")
        .eq("fonctionnalite", "reformulation")
        .limit(1)
        .maybeSingle();
      if (error) {
        setErreur("Impossible de vérifier le consentement.");
        setConsentement(false);
        return;
      }
      setConsentement(data !== null);
    }
    verifier();
  }, []);

  // 2. Le parent accepte → on enregistre une trace datée
  async function accepter() {
    setEnregistrement(true);
    setErreur("");
    const { error } = await supabase
      .from("consentements_ia")
      .insert({ fonctionnalite: "reformulation" });
    setEnregistrement(false);
    if (error) {
      setErreur("Impossible d'enregistrer le consentement.");
      return;
    }
    setConsentement(true);
  }

  // 3. Appel de la route serveur
  async function reformuler() {
    setEnCours(true);
    setErreur("");
    setReformule("");
    setCopie(false);
    try {
      const reponse = await fetch("/api/ia/reformuler", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
        body: JSON.stringify({ texte }),
      });
      const data = await reponse.json();
      if (!reponse.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
        return;
      }
      setReformule(data.reformule);
    } catch {
      setErreur("Connexion impossible. Réessayez.");
    } finally {
      setEnCours(false);
    }
  }

  // 4. Copier le résultat
  async function copier() {
    await navigator.clipboard.writeText(reformule);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <>
      <PageHeader
        eyebrow="Synthèses & exports"
        title="Reformulation neutre"
        subtitle="Transformez un message ou un récit en une version factuelle et apaisée."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* État : on vérifie encore le consentement */}
        {consentement === null && (
          <p className="text-[#1F2733]">Chargement…</p>
        )}

        {/* État : pas encore de consentement → l'encart RGPD */}
        {consentement === false && (
          <div className="carte rounded-lg border border-[#C2A24C] bg-white p-6 space-y-4">
            <h2 className="font-display text-xl text-[#15233F]">
              Avant d'utiliser cette aide
            </h2>
            <p className="text-sm leading-relaxed text-[#1F2733]">
              Le texte que vous collez est envoyé à <strong>Mistral</strong> (société
              française, hébergement en Union européenne) afin de produire une version
              neutre. Mistral ne réutilise pas votre texte pour entraîner ses modèles et ne
              le conserve pas durablement.
            </p>
            <p className="text-sm leading-relaxed text-[#1F2733]">
              N'y faites pas figurer de données de santé ni d'extraits de jugement. L'IA
              <strong> propose</strong> une reformulation ; vous restez responsable du
              contenu, que vous devez relire et valider. Cette aide ne constitue pas un
              conseil juridique.
            </p>
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}
            <button
              onClick={accepter}
              disabled={enregistrement}
              className="rounded-md bg-[#15233F] px-4 py-2 font-medium text-white hover:bg-[#1d2f54] disabled:opacity-50"
            >
              {enregistrement ? "Enregistrement…" : "J'ai compris et j'accepte"}
            </button>
          </div>
        )}

        {/* État : consentement donné → l'outil */}
        {consentement === true && (
          <>
            <div className="space-y-2">
              <label htmlFor="texte" className="block font-medium text-[#15233F]">
                Votre message
              </label>
              <textarea
                id="texte"
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                rows={6}
                maxLength={5000}
                placeholder="Collez ici le message à reformuler…"
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-[#1F2733] focus:border-[#C2A24C] focus:outline-none"
              />
              <p className="text-right text-xs text-gray-500">{texte.length} / 5000</p>
            </div>

            <button
              onClick={reformuler}
              disabled={!texte.trim() || enCours}
              className="rounded-md bg-[#15233F] px-4 py-2 font-medium text-white hover:bg-[#1d2f54] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enCours ? "Reformulation en cours…" : "Reformuler"}
            </button>

            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            {reformule && (
              <div className="carte rounded-lg border border-[#C2A24C] bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg text-[#15233F]">
                    Version neutre proposée
                  </h2>
                  <button
                    onClick={copier}
                    className="rounded-md border border-[#C2A24C] px-3 py-1 text-sm text-[#15233F] hover:bg-[#F8F6F1]"
                  >
                    {copie ? "Copié !" : "Copier"}
                  </button>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-[#1F2733]">
                  {reformule}
                </p>
                <p className="text-xs text-gray-500">
                  Relisez et corrigez cette proposition avant tout usage. Cette aide ne
                  constitue pas un conseil juridique.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}