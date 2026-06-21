"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "@/components/PageHeader";
import ControleDossier from "@/components/ControleDossier";
import FormMessage from "@/components/ui/FormMessage";
import { totauxFrais, totauxPension, resteDuGlobal, euros } from "@/lib/dossierCalculs";
import { getProcedureActiveId } from "@/lib/procedureActive";




export default function ExportPage() {
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [peutExporter, setPeutExporter] = useState(false);
  const [toutesLesPieces, setToutesLesPieces] = useState(false);

  async function genererDossier() {
    setMessage("");
    setEnCours(true);
    try {
      // Procédure active : tout l'export est cloisonné dessus.
      const procId = await getProcedureActiveId();

      // 1) On récupère les données, filtrées par période si elle est renseignée
      let reqEvents = supabase
        .from("events")
        .select("titre, categorie, date_evenement, heure_evenement, description_factuelle, child_id")
        .order("date_evenement", { ascending: true });
      if (du) reqEvents = reqEvents.gte("date_evenement", du);
      if (au) reqEvents = reqEvents.lte("date_evenement", au);

      let reqFrais = supabase
        .from("expenses")
        .select("libelle, categorie, montant, part_autre, date_frais, rembourse, child_id")
        .order("date_frais", { ascending: true });
      if (du) reqFrais = reqFrais.gte("date_frais", du);
      if (au) reqFrais = reqFrais.lte("date_frais", au);

      let reqPension = supabase
        .from("pension_payments")
        .select("mois_du, montant_du, montant_paye, date_paiement, procedure_id")
        .order("mois_du", { ascending: true });
      if (du) reqPension = reqPension.gte("mois_du", du);
      if (au) reqPension = reqPension.lte("mois_du", au);

      // Bordereau de pièces : filtré par période, SAUF si « toutes les pièces » est coché.
      let reqDocs = supabase
        .from("documents")
        .select("libelle, categorie, date_document, child_id")
        .order("date_document", { ascending: true });
      if (!toutesLesPieces) {
        if (du) reqDocs = reqDocs.gte("date_document", du);
        if (au) reqDocs = reqDocs.lte("date_document", au);
      }

      // Les enfants DE LA PROCÉDURE ACTIVE, pour le bordereau et le filtrage.
      let reqEnfants = supabase.from("children").select("id, prenom_ou_alias");
      if (procId) reqEnfants = reqEnfants.eq("procedure_id", procId);

      const [evRes, frRes, peRes, docRes, enRes] = await Promise.all([
        reqEvents,
        reqFrais,
        reqPension,
        reqDocs,
        reqEnfants,
      ]);

      const enfants = enRes.data ?? [];
      const idsProc = new Set(enfants.map((e) => e.id));
      // Garde une ligne si elle est rattachée à un enfant de la procédure,
      // ou si elle n'a aucun enfant (élément général).
      const garde = (cid: string | null) => cid === null || idsProc.has(cid);

      const events = (evRes.data ?? []).filter((e) => garde(e.child_id));
      const frais = (frRes.data ?? []).filter((f) => garde(f.child_id));
      const pension = (peRes.data ?? []).filter((p) => p.procedure_id === procId);
      const pieces = (docRes.data ?? []).filter((d) => garde(d.child_id));

      const nomEnfant = (id: string | null) =>
        enfants.find((e) => e.id === id)?.prenom_ou_alias ?? "—";

      // Totaux calculés une seule fois (mêmes fonctions que l'accueil).
      const calculFrais = totauxFrais(frais);
      const calculPension = totauxPension(pension);
      const synth = resteDuGlobal(calculPension.solde, calculFrais.resteDu);

      // 2) On construit le PDF
      const doc = new jsPDF();
      const periode =
        du || au
          ? `Période : ${du || "début"} au ${au || "aujourd'hui"}`
          : "Période : toutes les données";

      // --- Page de garde ---
      doc.setFontSize(22);
      doc.text("Dossier de coparentalité", 105, 40, { align: "center" });
      doc.setFontSize(12);
      doc.text("Parent Preuve", 105, 50, { align: "center" });
      doc.setFontSize(11);
      doc.text(periode, 105, 65, { align: "center" });
      doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 105, 72, { align: "center" });

      // Synthèse « reste dû » (même calcul que la bannière de l'accueil).
      doc.setFontSize(11);
      doc.text(
        `Reste dû${du || au ? " sur la période" : ""} : ${euros(synth.total)}`,
        105,
        80,
        { align: "center" }
      );
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `Pension impayée ${euros(synth.pensionResteDu)} · frais non remboursés ${euros(synth.fraisResteDu)}`,
        105,
        86,
        { align: "center" }
      );
      doc.setTextColor(0);

      // --- Chronologie des événements ---
      autoTable(doc, {
        startY: 105,
        head: [["Date", "Heure", "Catégorie", "Titre", "Description"]],
        body: events.map((e) => [
          e.date_evenement,
          e.heure_evenement ?? "",
          e.categorie,
          e.titre,
          e.description_factuelle ?? "",
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [51, 65, 85] },
        didDrawPage: () => {
          doc.setFontSize(13);
          doc.text("1. Chronologie des événements", 14, 100);
        },
      });

      // --- Tableau des frais ---
      let y = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(13);
      doc.text("2. Frais partagés", 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [["Date", "Libellé", "Catégorie", "Total", "Part due", "Remboursé"]],
        body: frais.map((f) => [
          f.date_frais,
          f.libelle,
          f.categorie,
          euros(Number(f.montant)),
          euros(Number(f.part_autre)),
          f.rembourse ? "Oui" : "Non",
        ]),
        foot: [["", "", "", "", `Reste dû : ${euros(calculFrais.resteDu)}`, ""]],
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [51, 65, 85] },
        footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42] },
      });

      // --- Tableau de pension ---
      y = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(13);
      doc.text("3. Pension alimentaire", 14, y);
      autoTable(doc, {
        startY: y + 5,
        head: [["Mois", "Dû", "Payé", "Date de paiement"]],
        body: pension.map((p) => [
          p.mois_du,
          euros(Number(p.montant_du)),
          euros(Number(p.montant_paye)),
          p.date_paiement ?? "—",
        ]),
        foot: [["", euros(calculPension.totalDu), euros(calculPension.totalPaye), `Solde : ${euros(calculPension.solde)}`]],
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [51, 65, 85] },
        footStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42] },
      });

      // --- Bordereau de pièces ---
      y = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(13);
      const titreBordereau = toutesLesPieces
        ? "4. Bordereau de pièces (toutes les pièces)"
        : "4. Bordereau de pièces";
      doc.text(titreBordereau, 14, y);

      if (pieces.length === 0) {
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text("Aucune pièce pour cette sélection.", 14, y + 8);
        doc.setTextColor(0);
      } else {
        autoTable(doc, {
          startY: y + 5,
          head: [["Pièce n°", "Date", "Libellé", "Catégorie", "Enfant"]],
          body: pieces.map((d, i) => [
            String(i + 1),
            d.date_document ?? "—",
            d.libelle,
            d.categorie,
            nomEnfant(d.child_id),
          ]),
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [51, 65, 85] },
        });
      }

      // --- Avertissement ---
      y = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(8);
      doc.setTextColor(120);
      const avertissement =
        "Ce document est généré à partir des données saisies par l'utilisateur. Il ne constitue pas un constat de commissaire de justice ni un conseil juridique, et doit être vérifié avant toute utilisation.";
      doc.text(doc.splitTextToSize(avertissement, 180), 14, y);

      // 3) Téléchargement
      doc.save(`dossier-parent-preuve-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      setMessage("Erreur : " + (e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#ECE7DC] text-[#1F2733]">
      <PageHeader
        eyebrow="Synthèses & exports"
        title="Export du dossier"
        subtitle="Préparez un PDF à relire avant de le transmettre."
      />
      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12 space-y-6">

        {/* Étape 1 : période */}
        <section className="carte rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-or-fonce">Étape 1</p>
            <h2 className="font-display text-lg text-[#15233F]">Choisir la période</h2>
            <p className="mt-1 text-sm text-slate-600">
              Facultatif. Laissez vide pour inclure toutes les données.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Du</label>
              <input
                type="date" value={du} onChange={(e) => setDu(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Au</label>
              <input
                type="date" value={au} onChange={(e) => setAu(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={toutesLesPieces}
                onChange={(e) => setToutesLesPieces(e.target.checked)}
              />
              Bordereau : inclure toutes les pièces (sinon, seules celles de la période)
            </label>
          </div>
        </section>

        {/* Étape 2 : contrôle avant export */}
        <section className="space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-or-fonce">Étape 2</p>
            <h2 className="font-display text-lg text-[#15233F]">Vérifier les points à compléter</h2>
          </div>
          <ControleDossier du={du} au={au} onChange={setPeutExporter} />
        </section>

        {/* Étape 3 : génération */}
        <section className="carte rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-or-fonce">Étape 3</p>
            <h2 className="font-display text-lg text-[#15233F]">Générer l&apos;export PDF</h2>
            <p className="mt-1 text-sm text-slate-600">
              Le PDF est une organisation factuelle de vos données, à relire avant
              toute transmission. Il ne constitue pas un avis juridique.
            </p>
          </div>
          <button
            onClick={genererDossier}
            disabled={enCours || !peutExporter}
            className="rounded-lg bg-[#15233F] px-5 py-2 text-white hover:bg-[#1d2f52] disabled:opacity-50"
          >
            {enCours ? "Génération…" : "Générer le PDF"}
          </button>
          <FormMessage message={message} type="erreur" />
        </section>
      </div>
    </main>
  );
}
