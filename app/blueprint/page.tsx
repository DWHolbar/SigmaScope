import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/PageHeader";
import {
  Activity,
  ClipboardList,
  ShieldAlert,
  Github,
  PenTool,
  Code,
  Database,
  PaintBucket,
  Server,
  type LucideIcon,
} from "lucide-react";

type Row = {
  href: string;
  tab: string;
  what: string;
  source: string;
  liveness: "Live" | "Curated" | "Estimated" | "Mixed";
};

const rows: Row[] = [
  {
    href: "/",
    tab: "Network Pulse",
    what: "Protocol fluency. Slot and epoch tick from beacon-chain genesis; participation and client diversity surface the primitives Sigma Prime builds.",
    source: "Genesis math + beaconcha.in + clientdiversity.org snapshot",
    liveness: "Mixed",
  },
  {
    href: "/blueprint",
    tab: "Blueprint",
    what: "This page. Explains what each tab does, where its data comes from, and what is honestly live vs curated vs estimated.",
    source: "Static markdown in this component",
    liveness: "Curated",
  },
  {
    href: "/scoping",
    tab: "Audit Scoping",
    what: "Client conversation simulator. Maps protocol type to threat model and an industry-anchored engagement estimate.",
    source: "Hand-coded threat library + LOC-bucket heuristic anchored to public audit firm rates",
    liveness: "Estimated",
  },
  {
    href: "/intel",
    tab: "Vulnerability Intel",
    what: "Searchable archive of 29 hand-curated exploits (2016 to 2025) plus a live overlay of newer incidents.",
    source: "Hand-written entries + DefiLlama hacks API (hourly cache)",
    liveness: "Mixed",
  },
  {
    href: "/github",
    tab: "GitHub Intelligence",
    what: "Live dashboard of Sigma Prime's open-source footprint at github.com/sigp, with a Lighthouse spotlight.",
    source: "GitHub REST API (hourly cache, anonymous, with offline snapshot fallback)",
    liveness: "Live",
  },
  {
    href: "/studio",
    tab: "Content Studio",
    what: "Eight content templates (tweet, thread, LinkedIn, newsletter, PR pitch, blog outline, technical FAQ, tool review) that combine a Sigma Prime topic with audience and tone to produce a first draft.",
    source: "Deterministic template engine over a curated topic library",
    liveness: "Curated",
  },
];

const livenessTone: Record<Row["liveness"], "ok" | "accent" | "warn" | "muted"> = {
  Live: "ok",
  Mixed: "accent",
  Estimated: "warn",
  Curated: "muted",
};

const tabIcons: Record<string, LucideIcon> = {
  "/": Activity,
  "/blueprint": Code,
  "/scoping": ClipboardList,
  "/intel": ShieldAlert,
  "/github": Github,
  "/studio": PenTool,
};

export default function BlueprintPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        tab="Tab 2 · Blueprint"
        badge="How this site is built"
        title="What you're looking at."
        description="SigmaScope is a TAM portfolio piece. Six tabs, each one demonstrating a different facet of the Sigma Prime Technical Account Manager role. This page is the map: what every tab is for, where its data comes from, and exactly which numbers are real vs curated vs estimated."
      />

      <Card>
        <CardHeader
          title="Architecture map"
          hint="One row per tab. Click any row to jump to it."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                <th className="py-2 pr-4 font-medium">Tab</th>
                <th className="py-2 pr-4 font-medium">What it demonstrates</th>
                <th className="py-2 pr-4 font-medium">Data source</th>
                <th className="py-2 pr-2 font-medium">Liveness</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const Icon = tabIcons[row.href] ?? Code;
                return (
                  <tr
                    key={row.href}
                    className="border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-900/40"
                  >
                    <td className="py-3 pr-4 align-top">
                      <Link
                        href={row.href}
                        className="group flex items-center gap-2 text-zinc-100 hover:text-accent"
                      >
                        <Icon size={14} className="shrink-0 text-zinc-500 group-hover:text-accent" />
                        <span className="font-medium">{row.tab}</span>
                      </Link>
                    </td>
                    <td className="py-3 pr-4 align-top text-[12px] leading-relaxed text-zinc-400">
                      {row.what}
                    </td>
                    <td className="py-3 pr-4 align-top text-[12px] leading-relaxed text-zinc-500">
                      {row.source}
                    </td>
                    <td className="py-3 pr-2 align-top">
                      <Badge tone={livenessTone[row.liveness]}>{row.liveness}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
          <span className="font-medium text-zinc-300">Reading the Liveness column.</span>{" "}
          <Badge tone="ok">Live</Badge> means a public API drives the number on every load.{" "}
          <Badge tone="accent">Mixed</Badge> means partial: some fields live, some curated.{" "}
          <Badge tone="warn">Estimated</Badge> means the number is a transparent heuristic.{" "}
          <Badge tone="muted">Curated</Badge> means hand-written content.
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Stack notes"
          hint="The tech choices and why."
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StackItem
            icon={Server}
            title="Next.js 14 (App Router)"
            body="Server components for the data-bound pages, client components for anything interactive. Zero-config Vercel deploy."
          />
          <StackItem
            icon={PaintBucket}
            title="Tailwind v3 + custom CSS variables"
            body="Dark mode default, accent cyan (#22d3ee). No UI library; primitives like Card, Badge, Dropdown are hand-built in components/ui/."
          />
          <StackItem
            icon={Code}
            title="Custom SVG charts"
            body="Donut and sparkline are stroke-dasharray arcs and polylines on fixed viewBoxes. Recharts was dropped in v1 because of SSR hydration issues; bundle size dropped from 195kB to 90kB."
          />
          <StackItem
            icon={Database}
            title="Three live data sources"
            body="beaconcha.in for Ethereum participation, DefiLlama for the hacks overlay, GitHub REST for the repo dashboard. All proxied through internal /api routes with timeouts and offline fallbacks."
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Honest limits"
          hint="What this site does NOT claim."
        />
        <ul className="flex flex-col gap-2 text-[13px] leading-relaxed text-zinc-300">
          <Limit>
            <span className="font-medium text-zinc-100">Audit pricing is not real.</span>{" "}
            Sigma Prime does not publish a rate card. The cost band on the Scoping tab is an
            industry-anchored estimate using public per-engineer-week rates from Trail of Bits,
            ConsenSys Diligence and OpenZeppelin. Only Sigma Prime's team can give a binding quote.
          </Limit>
          <Limit>
            <span className="font-medium text-zinc-100">Hacks coverage is not exhaustive.</span>{" "}
            The curated archive is 29 entries through Feb 2025. The DefiLlama overlay fills the
            gap forward, but it normalises on best-effort fields; expect occasional disagreements
            with primary sources.
          </Limit>
          <Limit>
            <span className="font-medium text-zinc-100">Content drafts are not LLM-generated.</span>{" "}
            The Content Studio uses deterministic template builders, not a real model. Output is
            polished enough to be a starting point, not auto-publish quality.
          </Limit>
          <Limit>
            <span className="font-medium text-zinc-100">No persistence.</span> Nothing you do is
            saved. Reload and you start fresh.
          </Limit>
          <Limit>
            <span className="font-medium text-zinc-100">Not affiliated with Sigma Prime.</span>{" "}
            This site was built independently as a portfolio piece for the TAM role and is not
            endorsed by Sigma Prime.
          </Limit>
        </ul>
      </Card>
    </div>
  );
}

function StackItem({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} className="text-accent" />
        <span className="text-sm font-medium text-zinc-100">{title}</span>
      </div>
      <p className="text-[12px] leading-relaxed text-zinc-400">{body}</p>
    </div>
  );
}

function Limit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-accent">&middot;</span>
      <span>{children}</span>
    </li>
  );
}
