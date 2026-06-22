// app/api/calendrier/jours-feries/route.ts
//
// Proxy serveur des jours fériés (etalab). L'appel externe se fait côté serveur
// (cache `revalidate` dans la lib). Ne renvoie jamais d'erreur fatale : en cas
// de souci, on répond une liste vide pour ne pas bloquer l'aperçu.

import { NextResponse } from "next/server";
import { fetchJoursFeries } from "@/lib/calendrier/joursFeries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const annee = Number(searchParams.get("annee")) || new Date().getFullYear();
  const zone = searchParams.get("zone") ?? "metropole";

  try {
    const data = await fetchJoursFeries(annee, zone);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
