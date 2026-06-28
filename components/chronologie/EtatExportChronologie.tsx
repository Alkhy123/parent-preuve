import { construireEtatExportChronologie } from "@/lib/chronologieEtatExport";

type Props = {
  lignes: string[][];
};

export default function EtatExportChronologie({ lignes }: Props) {
  const etat = construireEtatExportChronologie(lignes);

  const classes =
    etat.niveau === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-amber-200 bg-amber-50 text-amber-900";

  const titreClasses =
    etat.niveau === "ok" ? "text-emerald-950" : "text-amber-950";

  return (
    <div className={`mt-5 rounded-xl border p-4 text-sm leading-6 ${classes}`}>
      <p className={`font-semibold ${titreClasses}`}>{etat.titre}</p>
      <p className="mt-1">{etat.message}</p>
    </div>
  );
}
