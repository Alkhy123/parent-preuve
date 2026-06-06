// Moteur de calcul des périodes de garde.
// Pour l'instant : "un week-end sur deux" (DVH classique).

export type RegleGarde = {
    type_garde: string;
    parent_principal: "moi" | "autre";
    date_reference: string; // "YYYY-MM-DD"
    jour_debut: number;     // 1 = lundi … 7 = dimanche
    heure_debut: string;    // "HH:MM"
    jour_fin: number;
    heure_fin: string;
  };
  
  export type PeriodeGarde = {
    debut: Date;
    fin: Date;
    chezQui: "moi" | "autre";
  };
  
  export const JOURS = ["", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  
  // "YYYY-MM-DD" -> Date locale (évite les décalages de fuseau horaire).
  function dateLocale(iso: string): Date {
    const [a, m, j] = iso.split("-").map(Number);
    return new Date(a, m - 1, j);
  }
  
  // Ajoute "HH:MM" à une date.
  function avecHeure(d: Date, heure: string): Date {
    const [h, min] = heure.split(":").map(Number);
    const r = new Date(d);
    r.setHours(h || 0, min || 0, 0, 0);
    return r;
  }
  
  // jour : 1..7 (lundi..dimanche). getDay() : 0=dimanche..6=samedi.
  function memeJour(d: Date, jour: number): boolean {
    const js = jour === 7 ? 0 : jour;
    return d.getDay() === js;
  }
  
  // Recule jusqu'au dernier "jour" voulu (ex. vendredi) à la date d ou avant.
  function dernierJour(d: Date, jour: number): Date {
    const r = new Date(d);
    for (let i = 0; i < 7; i++) {
      if (memeJour(r, jour)) return r;
      r.setDate(r.getDate() - 1);
    }
    return r;
  }
  
  // Toutes les périodes de garde DVH entre `du` et `au`.
  export function periodesGarde(regle: RegleGarde, du: Date, au: Date): PeriodeGarde[] {
    // parent_principal = 'autre' -> l'enfant vit surtout chez l'autre -> le DVH est À MOI.
    // parent_principal = 'moi'   -> le DVH est à l'autre.
    const chezQui: "moi" | "autre" = regle.parent_principal === "autre" ? "moi" : "autre";
  
    const ref = dateLocale(regle.date_reference);
    const ancre = dernierJour(ref, regle.jour_debut); // début du week-end de référence
  
    let dureeJours = regle.jour_fin - regle.jour_debut;
    if (dureeJours < 0) dureeJours += 7; // vendredi->dimanche = 2 jours
  
    const MS_14J = 14 * 24 * 60 * 60 * 1000;
    const k = Math.floor((du.getTime() - ancre.getTime()) / MS_14J) - 1;
  
    const curseur = new Date(ancre);
    curseur.setDate(curseur.getDate() + k * 14); // on se place juste avant la fenêtre
  
    const periodes: PeriodeGarde[] = [];
    for (let i = 0; i < 100; i++) {
      const debut = avecHeure(curseur, regle.heure_debut);
      const finJour = new Date(curseur);
      finJour.setDate(finJour.getDate() + dureeJours);
      const fin = avecHeure(finJour, regle.heure_fin);
  
      if (fin >= du && debut <= au) periodes.push({ debut, fin, chezQui });
      if (debut > au) break;
  
      curseur.setDate(curseur.getDate() + 14); // un week-end sur deux
    }
    return periodes;
  }
  
  // Raccourci : les N prochaines périodes à partir d'aujourd'hui.
  export function prochainsWeekends(regle: RegleGarde, combien = 8): PeriodeGarde[] {
    const aujourdhui = new Date();
    const dans1An = new Date();
    dans1An.setFullYear(dans1An.getFullYear() + 1);
    return periodesGarde(regle, aujourdhui, dans1An)
      .filter((p) => p.fin >= aujourdhui)
      .slice(0, combien);
  }
import ProchainesEcheances from "@/components/ProchainesEcheances";
// Chez qui est l'enfant un jour donné, d'après les périodes calculées.
// Renvoie "moi"/"autre" si le jour tombe dans une période de garde,
// sinon null (l'écran appliquera alors le parent principal par défaut).
export function chezQuiLeJour(periodes: PeriodeGarde[], jour: Date): "moi" | "autre" | null {
  const debutJour = new Date(jour);
  debutJour.setHours(0, 0, 0, 0);
  const finJour = new Date(jour);
  finJour.setHours(23, 59, 59, 999);
  for (const p of periodes) {
    if (p.debut <= finJour && p.fin >= debutJour) return p.chezQui;
  }
  return null;
}