import { createHash } from "crypto";
// On reproduit la logique de calculerSha256Hex sur le mot "abc"
const contenu = Buffer.from("abc");
const hash = createHash("sha256").update(contenu).digest("hex");
console.log(hash);
console.log(hash === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" ? "OK ✅" : "ÉCART ❌");