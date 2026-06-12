import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VulnerabilityExplorer } from "@/components/intel/VulnerabilityExplorer";
import sources from "@/lib/data/intel-sources.json";

type Source = (typeof sources)[number];

const kindTone: Record<Source["kind"], "ok" | "muted"> = {
  "live-api": "ok",
  reference: "muted",
};

const kindLabel: Record<Source["kind"], string> = {
  "live-api": "live",
  reference: "reference",
};

export default function IntelPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tab="Tab 4 · Vulnerability Intel"
        badge="Historical exploits, 2016 to present"
        title="Every hack, three ways."
        description="Engineers want the call trace. Founders want the dollar figure and the headline. A TAM translates between them. Each curated entry below carries all three framings, plus how the kind of review Sigma Prime sells would have caught it."
        howToUse={
          <>
            The archive merges 29 hand-curated entries (2016 to 2025) with a live overlay from
            DefiLlama&rsquo;s hacks API, fetched on every page load and cached for one hour.
            Curated entries cite which databases they were cross-checked against. New incidents
            recorded by DefiLlama show up here automatically with a{" "}
            <span className="mono text-accent">live</span> badge.
          </>
        }
      />
      <VulnerabilityExplorer />

      <Card>
        <CardHeader
          title="Referenced databases"
          hint="Sources consulted during curation. DefiLlama drives the live overlay; the others are cross-references checked quarterly."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(sources as Source[]).map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="card card-hover group flex flex-col gap-2 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-zinc-100 group-hover:text-accent">
                  {s.name}
                </span>
                <Badge tone={kindTone[s.kind]}>{kindLabel[s.kind]}</Badge>
              </div>
              <p className="line-clamp-3 text-[12px] leading-relaxed text-zinc-400">
                {s.blurb}
              </p>
              <div className="mt-auto flex items-center justify-between text-[10px] text-zinc-500">
                <span className="mono">refresh: {s.refresh}</span>
                <ExternalLink size={11} className="text-zinc-600 group-hover:text-accent" />
              </div>
            </a>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
          QuillAudits and BlockSec do not publish documented public APIs. Their data is
          consulted by hand during the quarterly curation pass; the curated archive in this tab
          is the synthesis. See CLAUDE.md for the full curation process.
        </p>
      </Card>
    </div>
  );
}
