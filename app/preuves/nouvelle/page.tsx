"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { enteteAuth } from "@/lib/enteteAuth";
import { getEnfantsDeProcedureActive, getProcedureActiveId } from "@/lib/procedureActive";
import { journaliserAction } from "@/lib/auditLog";

// Type souple pour la liste des enfants (voir note en bas sur le nom de colonne).
type Enfant = {
    id: string;
    prenom_ou_alias: string | null;
  };
  
function nomEnfant(e: Enfant): string {
    return e.prenom_ou_alias || "Enfant";
}

// GPS du navigateur, emballé dans une promesse pour pouvoir l'attendre proprement.
function obtenirPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Géolocalisation non supportée"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

export default function NouvellePreuvePage() {
  // Fichier + analyse locale
  const [fichier, setFichier] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [empreinte, setEmpreinte] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<string | null>(null);

  // Champs de description
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [enfantId, setEnfantId] = useState("");
  const [enfants, setEnfants] = useState<Enfant[]>([]);

  // États d'interface
  const [enCours, setEnCours] = useState(false);          // calcul empreinte
  const [enregistrement, setEnregistrement] = useState(false); // sauvegarde
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);
  const [recap, setRecap] = useState<{
    gps: string;
    ecart: number;
    horodatage: string;
    verification: string;
  } | null>(null);

  // Charger la liste des enfants pour le menu déroulant
  useEffect(() => {
    getEnfantsDeProcedureActive().then((data) => setEnfants(data));
  }, []);

  async function onFichierChoisi(e: React.ChangeEvent<HTMLInputElement>) {
    setErreur(null);
    setMessageSucces(null);
    setRecap(null);
    setEmpreinte(null);
    setDimensions(null);
    setApercu(null);

    const f = e.target.files?.[0];
    if (!f) return;

    setFichier(f);
    setApercu(URL.createObjectURL(f));
    setEnCours(true);

    try {
      const buffer = await f.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const octets = Array.from(new Uint8Array(hashBuffer));
      setEmpreinte(octets.map((b) => b.toString(16).padStart(2, "0")).join(""));

      try {
        const bitmap = await createImageBitmap(f);
        setDimensions(`${bitmap.width} × ${bitmap.height} px`);
        bitmap.close();
      } catch {
        // certains formats (HEIC) ne se lisent pas ici : pas bloquant
      }
    } catch {
      setErreur("Impossible de traiter ce fichier. Réessaie avec une photo.");
    } finally {
      setEnCours(false);
    }
  }

  async function enregistrer() {
    if (!fichier || !empreinte) return;
    setErreur(null);
    setMessageSucces(null);
    setRecap(null);
    setEnregistrement(true);

    try {
      // 1) Utilisateur courant (pour construire le chemin de stockage)
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw new Error("Tu dois être connecté.");
      const userId = userData.user.id;

      // Cloisonnement : on résout la procédure AVANT l'upload pour ne pas
      // laisser de fichier orphelin si aucune procédure n'est active.
      const procedureId = await getProcedureActiveId();
      if (!procedureId)
        throw new Error(
          "Aucune procédure active. Créez d'abord une procédure avant d'ajouter une preuve."
        );

      // 2) Heure de l'appareil à l'instant de l'enregistrement
      const heureAppareil = new Date().toISOString();

      // 3) GPS (facultatif : si refusé ou indisponible, on continue sans)
      let gps: { lat: number; lng: number; precision: number } | null = null;
      try {
        const pos = await obtenirPosition();
        gps = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precision: pos.coords.accuracy,
        };
      } catch {
        // pas de GPS : ce n'est pas bloquant
      }

      // 4) Envoi du fichier ORIGINAL scellé dans le bucket "preuves"
      const preuveId = crypto.randomUUID();
      const nomSanitise = fichier.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const chemin = `${userId}/${preuveId}/${nomSanitise}`;
      const { error: upErr } = await supabase.storage
        .from("preuves")
        .upload(chemin, fichier, { contentType: fichier.type, upsert: false });
      if (upErr) throw new Error("Échec de l'envoi du fichier : " + upErr.message);

      // 5) Métadonnées techniques de base
      const metadonnees = {
        dimensions: dimensions ?? null,
        navigateur: navigator.userAgent,
      };

      // 6) Enregistrement de la ligne (created_at = heure SERVEUR, automatique)
      const { data: ligne, error: insErr } = await supabase
        .from("preuves_photo")
        .insert({
          id: preuveId,
          titre: titre || null,
          description: description || null,
          enfant_id: enfantId || null,
          procedure_id: procedureId,
          storage_path: chemin,
          nom_fichier: fichier.name,
          type_fichier: fichier.type || null,
          taille_octets: fichier.size,
          empreinte_sha256: empreinte,
          metadonnees,
          gps_latitude: gps?.lat ?? null,
          gps_longitude: gps?.lng ?? null,
          gps_precision_metres: gps?.precision ?? null,
          heure_appareil: heureAppareil,
        })
        .select("created_at")
        .single();
      if (insErr) {
        // Insertion échouée après l'upload : on retire le fichier orphelin.
        await supabase.storage.from("preuves").remove([chemin]);
        throw new Error("Échec de l'enregistrement : " + insErr.message);
      }

      // 7) Écart entre l'heure de l'appareil et l'heure du serveur
      const ecartSec = Math.round(
        (new Date(ligne.created_at).getTime() -
          new Date(heureAppareil).getTime()) /
          1000
      );
      await supabase
        .from("preuves_photo")
        .update({ ecart_heure_secondes: ecartSec })
        .eq("id", preuveId);

      // 7bis) Horodatage automatique.
      // Option A : si l'horodatage échoue, on N'ANNULE PAS la preuve.
      // Elle reste scellée (photo + empreinte + heure serveur) ;
      // on marque juste le statut "a_refaire" pour pouvoir réessayer plus tard.
      let horodatageOK = false;
      try {
        const reponse = await fetch("/api/horodatage", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
          body: JSON.stringify({ empreinte }),
        });
        if (!reponse.ok) throw new Error("réponse non OK");
        const h = await reponse.json();
        await supabase
          .from("preuves_photo")
          .update({
            horodatage_jeton: h.jeton,
            horodatage_date: h.date,
            horodatage_statut: h.statut, // "non_qualifie"
            horodatage_prestataire: h.prestataire, // "interne"
            horodatage_algorithme: h.algorithme, // "HMAC-SHA256"
          })
          .eq("id", preuveId);
        horodatageOK = true;
      } catch {
        await supabase
          .from("preuves_photo")
          .update({ horodatage_statut: "a_refaire" })
          .eq("id", preuveId);
      }

      // 7ter) Vérification serveur du hash.
      // Le serveur retélécharge le fichier stocké, recalcule son empreinte et la
      // compare à celle calculée par le navigateur. Comme pour l'horodatage
      // (Option A) : si la vérification échoue, on N'ANNULE PAS la preuve.
      let verificationTexte = "non vérifié";
      try {
        const reponseV = await fetch("/api/preuves/verifier-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await enteteAuth()) },
          body: JSON.stringify({ id: preuveId }),
        });
        if (!reponseV.ok) throw new Error("réponse non OK");
        const v = await reponseV.json();
        verificationTexte = v.hash_verifie
          ? "empreinte recalculée côté serveur : concordante"
          : "écart constaté entre l'empreinte d'origine et l'empreinte recalculée";
      } catch {
        // La preuve reste scellée ; la vérification pourra être refaite plus tard.
        verificationTexte = "vérification serveur indisponible (à refaire)";
      }

      // Audit minimal : trace technique de la création (aucun contenu sensible).
      void journaliserAction("preuve.creation", {
        cibleType: "preuve_photo",
        cibleId: preuveId,
        procedureId,
        metadonnees: { horodatage_ok: horodatageOK },
      });

      // 8) Récap à l'écran
      setRecap({
        gps: gps
          ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} (±${Math.round(
              gps.precision
            )} m)`
          : "non disponible",
        ecart: ecartSec,
        horodatage: horodatageOK
        ? "horodaté (non qualifié)"
        : "à refaire (échec, preuve quand même scellée)",
      verification: verificationTexte,
    });
      setMessageSucces("Preuve enregistrée et scellée.");

      // Réinitialiser le formulaire pour une éventuelle nouvelle preuve
      setFichier(null);
      setApercu(null);
      setEmpreinte(null);
      setDimensions(null);
      setTitre("");
      setDescription("");
      setEnfantId("");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setEnregistrement(false);
    }
  }

  function formaterTaille(octets: number): string {
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC]">
      <PageHeader
        eyebrow="Preuve photo"
        title="Nouvelle preuve"
        subtitle="Prends ou choisis une photo : l'application la scelle, l'horodate et calcule son empreinte d'intégrité."
      />

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Sélection / capture */}
        <div className="carte rounded-lg border border-[#C2A24C]/40 bg-white p-6">
          <label className="block text-sm font-medium text-[#1F2733] mb-2">
            Photo
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFichierChoisi}
            className="block w-full text-sm text-[#1F2733]
                       file:mr-4 file:rounded-md file:border-0
                       file:bg-[#15233F] file:px-4 file:py-2
                       file:text-sm file:font-medium file:text-white
                       hover:file:bg-[#15233F]/90"
          />
          <p className="mt-2 text-xs text-[#1F2733]/60">
            Sur mobile, le bouton ouvre directement l&apos;appareil photo.
          </p>
        </div>

        {erreur && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        {messageSucces && (
          <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 space-y-1">
            <p className="font-medium">{messageSucces}</p>
            {recap && (
              <>
                <p>
                  Écart heure appareil / serveur : {recap.ecart} s
                  {Math.abs(recap.ecart) > 120 &&
                    " — écart important, à vérifier"}
                </p>
                <p>Horodatage : {recap.horodatage}</p>
                <p>Intégrité : {recap.verification}</p>
              </>
              
            )}
          </div>
        )}

        {enCours && (
          <p className="text-sm text-[#1F2733]/70">
            Calcul de l&apos;empreinte en cours…
          </p>
        )}

        {/* Aperçu + détails + champs */}
        {fichier && !enCours && (
          <div className="carte rounded-lg border border-[#C2A24C]/40 bg-white p-6 space-y-5">
            {apercu && (
              // Aperçu local d'un blob (URL.createObjectURL) : dimensions inconnues
              // et URL éphémère -> next/image n'apporte rien ici.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apercu}
                alt="Aperçu de la photo"
                className="max-h-64 rounded-md border border-[#15233F]/10"
              />
            )}

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#1F2733]/60">Nom du fichier</dt>
                <dd className="text-right font-medium text-[#1F2733] break-all">
                  {fichier.name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#1F2733]/60">Type</dt>
                <dd className="font-medium text-[#1F2733]">
                  {fichier.type || "inconnu"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#1F2733]/60">Taille</dt>
                <dd className="font-medium text-[#1F2733]">
                  {formaterTaille(fichier.size)}
                </dd>
              </div>
              {dimensions && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1F2733]/60">Dimensions</dt>
                  <dd className="font-medium text-[#1F2733]">{dimensions}</dd>
                </div>
              )}
            </dl>

            {empreinte && (
              <div>
                <p className="text-sm text-[#1F2733]/60 mb-1">Empreinte SHA-256</p>
                <p className="rounded-md bg-[#F8F6F1] px-3 py-2 font-mono text-xs
                              text-[#15233F] break-all border border-[#C2A24C]/30">
                  {empreinte}
                </p>
              </div>
            )}

            {/* Champs de description */}
            <div className="space-y-4 border-t border-[#15233F]/10 pt-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2733] mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex. État du logement, document remis…"
                  className="w-full rounded-md border border-[#15233F]/20 px-3 py-2 text-sm bg-white text-[#1F2733]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2733] mb-1">
                  Description factuelle
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décris les faits de manière neutre : date, lieu, ce que montre la photo."
                  className="w-full rounded-md border border-[#15233F]/20 px-3 py-2 text-sm bg-white text-[#1F2733]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2733] mb-1">
                  Enfant concerné (facultatif)
                </label>
                <select
                  value={enfantId}
                  onChange={(e) => setEnfantId(e.target.value)}
                  className="w-full rounded-md border border-[#15233F]/20 px-3 py-2 text-sm bg-white text-[#1F2733]"
                >
                  <option value="">— Aucun —</option>
                  {enfants.map((e) => (
                    <option key={e.id} value={e.id}>
                      {nomEnfant(e)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={enregistrer}
              disabled={enregistrement || !empreinte}
              className="w-full rounded-md bg-[#15233F] px-4 py-2.5 text-sm
                         font-medium text-white hover:bg-[#15233F]/90
                         disabled:opacity-50"
            >
              {enregistrement
                ? "Enregistrement en cours…"
                : "Enregistrer et sceller la preuve"}
            </button>
          </div>
        )}

        <p className="text-xs leading-relaxed text-[#1F2733]/60">
          L&apos;empreinte identifie de façon unique le contenu exact du fichier : la moindre
          modification la change entièrement. Cette preuve numérique renforcée ne constitue
          pas un constat de commissaire de justice.
        </p>
      </div>
    </main>
  );
}
