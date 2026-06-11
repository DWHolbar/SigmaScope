import { Info } from "lucide-react";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function PageHeader({
  tab,
  badge,
  title,
  description,
  howToUse,
}: {
  tab: string;
  badge?: string;
  title: string;
  description: ReactNode;
  howToUse?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{tab}</Badge>
        {badge && <Badge tone="muted">{badge}</Badge>}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      <p className="max-w-3xl text-sm text-zinc-400">{description}</p>
      {howToUse && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-[12px] text-zinc-300">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" />
          <span>{howToUse}</span>
        </div>
      )}
    </header>
  );
}
