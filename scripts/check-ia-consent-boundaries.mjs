import fs from "node:fs";

const routes = [
  {
    chemin: "app/api/ia/reformuler/route.ts",
    fonctionnalite: "reformulation",
  },
  {
    chemin: "app/api/ia/extraire/route.ts",
    fonctionnalite: "extraction",
  },
  {
    chemin: "app/api/ia/extraire-pdf/route.ts",
    fonctionnalite: "extraction",
  },
];

const erreurs = [];

for (const route of routes) {
  const source = fs.readFileSync(route.chemin, "utf8");
  const marqueurAuth = "const utilisateur = await utilisateurDeLaRequete(request)";
  const marqueurConsentement =
    `const consentement = await verifierConsentementIa(request, "${route.fonctionnalite}")`;
  const marqueurQuota = "const quota = await verifierQuotaIa(";

  if (!source.includes('from "@/lib/consentementIaServeur"')) {
    erreurs.push(`${route.chemin} n'importe pas le contrôle serveur du consentement.`);
  }

  const indexAuth = source.indexOf(marqueurAuth);
  const indexConsentement = source.indexOf(marqueurConsentement);
  const indexQuota = source.indexOf(marqueurQuota);

  if (indexConsentement === -1) {
    erreurs.push(
      `${route.chemin} ne vérifie pas le consentement "${route.fonctionnalite}".`
    );
  }

  if (
    indexAuth === -1 ||
    indexConsentement === -1 ||
    indexQuota === -1 ||
    !(indexAuth < indexConsentement && indexConsentement < indexQuota)
  ) {
    erreurs.push(
      `${route.chemin} doit vérifier auth -> consentement -> quota dans cet ordre.`
    );
  }

  if (!source.includes("{ status: 403 }")) {
    erreurs.push(`${route.chemin} doit refuser l'absence de consentement en HTTP 403.`);
  }
}

if (erreurs.length > 0) {
  console.error("❌ Frontières de consentement IA invalides :\n");
  for (const erreur of erreurs) console.error(`- ${erreur}`);
  process.exit(1);
}

console.log("✅ Consentement IA serveur vérifié sur les routes sensibles.");
