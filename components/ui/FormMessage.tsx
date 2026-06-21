type Type = "succes" | "erreur";

type Props = {
  message?: string | null;
  // Forcer le ton du message. Si absent, on déduit l'erreur du préfixe
  // (« Erreur… », « Impossible… ») et tout le reste est traité en succès.
  type?: Type;
};

function estErreur(message: string) {
  return /^(erreur|impossible)/i.test(message.trim());
}

// Message de formulaire unifié (succès en vert, erreur en rouge palette).
// Renvoie null quand il n'y a rien à afficher, pour rester sobre.
export default function FormMessage({ message, type }: Props) {
  if (!message) return null;
  const erreur = type ? type === "erreur" : estErreur(message);
  return (
    <p
      role="status"
      className={`text-sm ${erreur ? "text-[#9B2C2C]" : "text-[#2E6A4D]"}`}
    >
      {message}
    </p>
  );
}
