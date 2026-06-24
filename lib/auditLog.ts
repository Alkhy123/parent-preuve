// lib/auditLog.ts
// Journal d'audit minimal (bloc P1-B). Ecrit une ligne dans la table audit_log
// (migration 014) pour tracer une action sensible.
//
// RGPD / AGENTS.md §12 : ne JAMAIS passer de contenu familial a ce helper.
//   action     = code technique de l'action (enum ci-dessous) ;
//   cibleType  = nom de table concernee (technique) ;
//   cibleId    = identifiant de la cible ;
//   procedureId= cloisonnement ;
//   metadonnees= UNIQUEMENT des valeurs techniques (compteurs, booleens de
//                resultat). Pas de titre, pas de description, pas de nom
//                d'enfant, pas de GPS, pas d'empreinte.
//
// Best-effort : un echec d'audit ne doit JAMAIS bloquer ni faire echouer
//   l'action utilisateur. Toute erreur est avalee silencieusement.
//
// Portee honnete : trace applicative cote client sous RLS, NON infalsifiable.
//   Ce n'est pas un journal forensique ; ne pas le presenter comme tel.

import { supabase } from "@/lib/supabase";

export type ActionAudit =
  | "export.generation"
  | "preuve.creation"
  | "preuve.horodatage"
  | "preuve.verification_hash"
  // TODO (cablage restant, hors bloc minimal P1-B) :
  // - "event.modification"        depuis app/journal
  // - "document.suppression"      depuis app/documents
  // - "procedure.changement_active" depuis lib/procedureActive.ts
  // - "compte.suppression"        cote serveur (app/api/compte/supprimer),
  //   via supabaseAdmin et non ce helper client.
  | "event.modification"
  | "document.suppression"
  | "procedure.changement_active";

type ValeurTechnique = string | number | boolean | null;

type OptionsAudit = {
  cibleType?: string;
  cibleId?: string | null;
  procedureId?: string | null;
  metadonnees?: Record<string, ValeurTechnique>;
};

export async function journaliserAction(
  action: ActionAudit,
  options: OptionsAudit = {}
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return;

    await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      cible_type: options.cibleType ?? null,
      cible_id: options.cibleId ?? null,
      procedure_id: options.procedureId ?? null,
      metadonnees: options.metadonnees ?? null,
    });
  } catch {
    // Best-effort : on n'interrompt jamais l'action utilisateur pour un audit.
  }
}
