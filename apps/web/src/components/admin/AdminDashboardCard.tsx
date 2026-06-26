import Link from "next/link";

type AdminDashboardCardProps = {
  href: string;
  title: string;
  description: string;
  eyebrow?: string;
  metric?: string;
};

export function AdminDashboardCard({
  href,
  title,
  description,
  eyebrow,
  metric,
}: AdminDashboardCardProps) {
  return (
    <Link
      className="group rounded-md border border-ink/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-copper/35"
      href={href}
    >
      {eyebrow && (
        <p className="text-xs font-black uppercase tracking-[0.16em] text-copper">
          {eyebrow}
        </p>
      )}
      <div className="mt-3 flex items-start justify-between gap-4">
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        {metric && (
          <span className="rounded-full bg-ink px-3 py-1 text-sm font-black text-white">
            {metric}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/60">{description}</p>
      <p className="mt-5 text-sm font-black text-mineral group-hover:text-copper">
        Abrir modulo
      </p>
    </Link>
  );
}
