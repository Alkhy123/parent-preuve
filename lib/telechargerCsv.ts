// lib/telechargerCsv.ts
//
// Helper WEB UNIQUEMENT : déclenche le téléchargement d'une chaîne CSV via un Blob.
// Utilise document / URL / Blob → à n'appeler que côté navigateur (composant
// "use client"). En mobile (React Native) ce fichier n'est tout simplement pas
// importé ; la génération CSV pure reste dans lib/csvExport.ts.

export function telechargerCsv(contenu: string, nomFichier: string) {
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
