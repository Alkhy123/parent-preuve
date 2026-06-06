type PageHeaderProps = {
    eyebrow?: string;
    title: string;
    subtitle?: string;
  };
  
  export default function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
    return (
      <section className="bg-[#15233F] text-[#F8F6F1]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.3em] text-[#C2A24C]">{eyebrow}</p>
          )}
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
          <div className="mt-4 h-px w-16 bg-[#C2A24C]" />
          {subtitle && <p className="mt-4 max-w-xl text-[#F8F6F1]/70">{subtitle}</p>}
        </div>
      </section>
    );
  }