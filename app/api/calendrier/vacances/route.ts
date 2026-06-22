// app/api/calendrier/vacances/route.ts
//
// Proxy serveur des vacances scolaires (data.education.gouv.fr). L'appel externe
// se fait côté serveur (cache `revalidate` dans la lib). Ne renvoie jamais
// d'erreur fatale : liste vide en repli pour ne pas bloquer l'aperçu.

import { NextResponse } from "next/server";
import { fetchVacances } from "@/lib/calendrier/vacancesScolaires";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zone = searchParams.get("zone") ?? "A";
  const du = searchParams.get("du") ?? "";
  const au = searchParams.get("au") ?? "";

  try {
    const data = await fetchVacances(zone, du, au);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
