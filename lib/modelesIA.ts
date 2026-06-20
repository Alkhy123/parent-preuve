// lib/modelesIA.ts
// Source unique des identifiants de modèles Mistral.
// Identifiants VERSIONNÉS (pas d'alias "-latest", déprécié et instable en prod).
// Vérifiés le 16/06/2026 via l'API Mistral GET /v1/models.

// Reformulation des textes utilisateur : modèle "medium" (3.5) pour une meilleure
// finesse de français et fidélité au vocabulaire d'origine.
export const MODELE_REFORMULATION = "mistral-medium-2604";

// Extraction structurée des règles du jugement : identique au comportement actuel
// (mistral-small-latest pointait déjà vers cette version le 16/06/2026).
export const MODELE_EXTRACTION = "mistral-small-2603";

// OCR des PDF de jugement : OCR 3.
export const MODELE_OCR = "mistral-ocr-2512";

// Assistant (questions/réponses lecture seule sur le résumé du dossier) :
// modèle "small", suffisant pour des réponses courtes et factuelles.
export const MODELE_ASSISTANT = "mistral-small-2603";
