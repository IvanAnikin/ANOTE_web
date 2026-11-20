import Link from "next/link";
import type { Crumb } from "@/lib/jsonld";

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Drobečková navigace" className="text-sm text-text-secondary">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.path} className="hover:text-primary transition-colors">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-primary">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
