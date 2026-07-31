export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="mb-3 text-[11px] tracking-[0.35em] text-gold uppercase">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      <div
        className={`mt-4 h-px w-24 bg-gold-gradient ${align === "center" ? "mx-auto" : ""}`}
        aria-hidden
      />
      {description && (
        <p className="mt-5 text-sm leading-8 text-muted-foreground md:text-base">{description}</p>
      )}
    </div>
  );
}