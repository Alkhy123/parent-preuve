import { construireApercuExportChronologie } from "@/lib/chronologieApercuExport";

type Props = {
  lignes: string[][];
};

export default function ApercuExportChronologie({ lignes }: Props) {
  const apercu = construireApercuExportChronologie(lignes, 5);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--or-fonce)]">
            Aperçu avant export
          </p>

          <h3 className="mt-1 text-lg font-bold text-[var(--app-text)]">
            Vérifier les lignes qui partiront dans le PDF ou le CSV
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">
            Cet aperçu reprend les mêmes filtres que les boutons d’export :
            période, types sélectionnés et procédure active.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[var(--app-text-muted)]">
          <p className="font-semibold text-[var(--app-text)]">
            {apercu.totalLignes} ligne
            {apercu.totalLignes > 1 ? "s" : ""} à exporter
          </p>

          {apercu.lignesMasquees > 0 && (
            <p className="mt-1">
              {apercu.lignesMasquees} ligne
              {apercu.lignesMasquees > 1 ? "s" : ""} supplémentaire
              {apercu.lignesMasquees > 1 ? "s" : ""} non affichée
              {apercu.lignesMasquees > 1 ? "s" : ""} dans l’aperçu.
            </p>
          )}
        </div>
      </div>

      {apercu.totalLignes === 0 ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Aucun élément ne correspond aux filtres actuels. Modifiez la période
          ou les types sélectionnés avant de générer un export.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--app-text-muted)]">
              <tr>
                {apercu.colonnes.map((colonne) => (
                  <th key={colonne} scope="col" className="px-3 py-3">
                    {colonne}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {apercu.lignesApercu.map((ligne, index) => (
                <tr key={`${ligne[0] ?? "ligne"}-${ligne[2] ?? "type"}-${index}`}>
                  {apercu.colonnes.map((colonne, colonneIndex) => (
                    <td
                      key={`${colonne}-${colonneIndex}`}
                      className="max-w-[260px] px-3 py-3 align-top text-[var(--app-text-muted)]"
                    >
                      <span className="line-clamp-3">
                        {ligne[colonneIndex] || "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-[var(--app-text-muted)]">
        L’aperçu est un contrôle de cohérence. Relisez le PDF ou le CSV généré
        avant toute transmission.
      </p>
    </section>
  );
}
