import Link from "next/link";

export default function Footer() {
  const annee = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-[#15233F] text-[#F8F6F1]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="font-display text-lg">Parent Preuve</p>
        <div className="mt-2 h-px w-12 bg-[#C2A24C]" />
        <p className="mt-3 max-w-xl text-sm text-[#F8F6F1]/70">
          Aide à l&apos;organisation d&apos;un dossier factuel de coparentalité. Ne constitue pas
          un conseil juridique.
        </p>

        <nav className="mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
          <Link
            href="/mentions-legales"
            className="text-[#F8F6F1] underline underline-offset-4 hover:text-[#C2A24C]"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="text-[#F8F6F1] underline underline-offset-4 hover:text-[#C2A24C]"
          >
            Politique de confidentialité
          </Link>
        </nav>

        <p className="mt-6 text-xs text-[#F8F6F1]/50">© {annee} Parent Preuve</p>
      </div>
    </footer>
  );
}