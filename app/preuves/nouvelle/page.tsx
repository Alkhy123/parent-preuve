"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";
import { Icon } from "@/components/apercu/icones";
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

// Styles communs des champs (tokens de thème).
const champClass = "mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none";
const champStyle = {
  borderColor: "var(--app-border)",
  backgroundColor: "var(--app-surface)",
  color: "var(--app-text)",
} as const;

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
        : "à refaire (élément conservé avec son empreinte)",
      verification: verificationTexte,
    });
      setMessageSucces("Élément enregistré avec sa traçabilité technique.");

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
    <AppShell
      activeModule="preuves"
      title="Ajouter une photo au dossier"
      subtitle="Ajoutez une photo utile à votre dossier, avec des informations techniques de traçabilité."
      copilotContext="preuves"
      actions={
        <Link
          href="/preuves"
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition"
          style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        >
          <Icon name="retour" className="h-4 w-4" />
          Retour aux preuves
        </Link>
      }
    >
      <div className="space-y-5">
        {/* Encart prudent sur la portée juridique */}
        <div
          className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs"
          style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
        >
          <span style={{ color: "var(--app-text-muted)" }}>
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0" />
          </span>
          <p>
            Les informations techniques peuvent aider à organiser et contextualiser
            l&apos;élément. Leur portée s&apos;apprécie au cas par cas : l&apos;application
            ne remplace pas un commissaire de justice, un avocat ou une décision du juge.
          </p>
        </div>

        <div className="app-form-grid">
          <div className="space-y-5">
        {/* Sélection / capture */}
        <section className="rounded-xl border p-5 sm:p-6" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--app-primary-soft)", color: "var(--app-primary)" }}
              aria-hidden="true"
            >
              <Icon name="preuves" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                1. Choisir la photo
              </p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                Ajoutez une photo utile à votre dossier. Sur mobile, le choix du fichier
                peut ouvrir directement l&apos;appareil photo.
              </p>
            </div>
          </div>

          <div
            className="mt-4 rounded-lg border p-3"
            style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)" }}
          >
            <input
              id="preuve-photo-fichier"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFichierChoisi}
              className="sr-only"
            />
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--app-text-muted)" }}>
                  Fichier sélectionné
                </p>
                <p className="mt-1 break-words text-sm font-medium" style={{ color: "var(--app-text)" }}>
                  {fichier ? fichier.name : "Aucun fichier sélectionné"}
                </p>
              </div>
              <label
                htmlFor="preuve-photo-fichier"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition sm:w-auto"
                style={{ backgroundColor: "var(--app-primary)", color: "var(--app-on-primary)" }}
              >
                <Icon name="plus" className="h-4 w-4" />
                Choisir une photo
              </label>
            </div>
          </div>
        </section>

        {erreur && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {erreur}
          </p>
        )}

        {messageSucces && (
          <div className="space-y-1 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            Calcul de l&apos;empreinte en cours…
          </p>
        )}

        {/* Aperçu + détails + champs */}
        {fichier && !enCours && (
          <div className="space-y-4">
            <section className="rounded-xl border p-5 sm:p-6" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                    2. Décrire le contexte
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--app-text-muted)" }}>
                    Ajoutez les éléments utiles à la relecture : date, lieu, situation observée.
                  </p>
                </div>
              </div>

              {apercu && (
                <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: "var(--app-border)" }}>
                  {/* Aperçu local d'un blob (URL.createObjectURL) : dimensions inconnues
                     et URL éphémère -> next/image n'apporte rien ici. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={apercu}
                    alt="Aperçu de la photo"
                    className="max-h-72 w-full object-contain"
                    style={{ backgroundColor: "var(--app-surface-muted)" }}
                  />
                </div>
              )}

              {/* Champs de description */}
              <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--app-text)" }}>
                  Titre
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex. État du logement, document remis…"
                  className={champClass}
                  style={champStyle}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--app-text)" }}>
                  Description factuelle
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décris les faits de manière neutre : date, lieu, ce que montre la photo."
                  className={champClass}
                  style={champStyle}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: "var(--app-text)" }}>
                  Enfant concerné (facultatif)
                </label>
                <select
                  value={enfantId}
                  onChange={(e) => setEnfantId(e.target.value)}
                  className={champClass}
                  style={champStyle}
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
            </section>

            <section className="rounded-xl border p-5 sm:p-6" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "var(--app-primary-soft)", color: "var(--app-primary)" }}
                  aria-hidden="true"
                >
                  <Icon name="shield" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                    3. Informations techniques et traçabilité
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                    Ces informations aident à organiser et contextualiser l&apos;élément.
                    Elles ne garantissent pas sa valeur dans une procédure.
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border p-3" style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)" }}>
                  <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--app-text-muted)" }}>
                    Nom du fichier
                  </dt>
                  <dd className="mt-1 break-all font-medium" style={{ color: "var(--app-text)" }}>
                    {fichier.name}
                  </dd>
                </div>
                <div className="rounded-lg border p-3" style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)" }}>
                  <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--app-text-muted)" }}>
                    Type
                  </dt>
                  <dd className="mt-1 font-medium" style={{ color: "var(--app-text)" }}>
                    {fichier.type || "inconnu"}
                  </dd>
                </div>
                <div className="rounded-lg border p-3" style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)" }}>
                  <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--app-text-muted)" }}>
                    Taille
                  </dt>
                  <dd className="mt-1 font-medium" style={{ color: "var(--app-text)" }}>
                    {formaterTaille(fichier.size)}
                  </dd>
                </div>
                {dimensions && (
                  <div className="rounded-lg border p-3" style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)" }}>
                    <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--app-text-muted)" }}>
                      Dimensions
                    </dt>
                    <dd className="mt-1 font-medium" style={{ color: "var(--app-text)" }}>{dimensions}</dd>
                  </div>
                )}
              </dl>

              {empreinte && (
                <div className="mt-4">
                  <p className="mb-1 text-sm font-medium" style={{ color: "var(--app-text)" }}>Empreinte SHA-256</p>
                  <p
                    className="break-all rounded-md border px-3 py-2 font-mono text-xs"
                    style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
                  >
                    {empreinte}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-xl border p-5 sm:p-6" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                4. Enregistrer dans la procédure active
              </h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
                L&apos;original sera conservé dans l&apos;espace privé de la procédure active,
                avec les informations techniques disponibles.
              </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                onClick={enregistrer}
                disabled={enregistrement || !empreinte}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 sm:w-auto"
                style={{ backgroundColor: "var(--app-primary)", color: "var(--app-on-primary)" }}
              >
                <Icon name="check" className="h-4 w-4" />
                {enregistrement
                  ? "Enregistrement en cours…"
                  : "Enregistrer l’élément"}
              </button>
              <Link
                href="/preuves"
                className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition sm:w-auto"
                style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
              >
                Annuler
              </Link>
            </div>
            </section>
          </div>
        )}

          </div>

          <aside className="space-y-4">
            <div
              className="rounded-xl border p-4 text-xs leading-relaxed"
              style={{ backgroundColor: "var(--app-surface-muted)", borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
            >
              L&apos;empreinte identifie le contenu exact du fichier : la moindre modification la
              change entièrement. Cet élément reste une pièce de dossier ; sa portée s&apos;apprécie
              au cas par cas.
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
