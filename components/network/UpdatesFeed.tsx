import updates from "@/lib/data/eth-updates.json";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function UpdatesFeed() {
  return (
    <ul className="flex flex-col divide-y divide-zinc-800/80">
      {updates.updates.map((u) => (
        <li key={u.title} className="py-3 first:pt-0 last:pb-0">
          <a
            href={u.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start justify-between gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-100 group-hover:text-accent">
                  {u.title}
                </span>
                <Badge tone="muted">{u.category}</Badge>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{u.summary}</p>
            </div>
            <ArrowUpRight
              size={14}
              className="mt-1 shrink-0 text-zinc-600 group-hover:text-accent"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
