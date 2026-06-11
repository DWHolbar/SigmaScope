import { Star, GitFork, AlertCircle, Tag, ExternalLink, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { LighthouseSpotlight as Data } from "@/lib/github";

function daysAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "1 day ago";
  if (d < 30) return `${d} days ago`;
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  return `${Math.floor(d / 365)} years ago`;
}

export function LighthouseSpotlight({ data }: { data: Data }) {
  const latest = data.releases[0];

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-accent/30 bg-accent/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge tone="accent">Flagship</Badge>
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-accent"
            >
              github.com/sigp/lighthouse <ExternalLink size={10} />
            </a>
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">Lighthouse</h3>
          <p className="mt-1 max-w-2xl text-[13px] text-zinc-400">{data.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox icon={Star} label="Stars" value={data.stars.toLocaleString()} />
        <StatBox icon={GitFork} label="Forks" value={data.forks.toLocaleString()} />
        <StatBox
          icon={AlertCircle}
          label="Open issues + PRs"
          value={data.openIssues.toLocaleString()}
        />
        <StatBox
          icon={Tag}
          label="Latest release"
          value={latest?.tag ?? "n/a"}
          hint={latest ? daysAgo(latest.publishedAt) : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Section title="Recent releases">
          <ul className="flex flex-col">
            {data.releases.map((r) => (
              <li key={r.tag} className="border-b border-zinc-800/60 py-2 last:border-b-0">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-2 text-[12px]"
                >
                  <span className="mono text-accent group-hover:underline">{r.tag}</span>
                  <span className="text-[10px] text-zinc-500">{daysAgo(r.publishedAt)}</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Top contributors">
          <ul className="flex flex-col">
            {data.contributors.map((c, i) => (
              <li key={c.login} className="border-b border-zinc-800/60 py-2 last:border-b-0">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 text-[12px]"
                >
                  <img
                    src={c.avatarUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 rounded-full bg-zinc-800"
                  />
                  <span className="flex-1 truncate text-zinc-200 group-hover:text-accent">
                    {c.login}
                  </span>
                  {i === 0 && <Badge tone="accent">lead</Badge>}
                  <span className="mono text-[10px] text-zinc-500">
                    {c.contributions.toLocaleString()}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Recent commits">
          <ul className="flex flex-col">
            {data.recentCommits.map((c) => (
              <li key={c.sha} className="border-b border-zinc-800/60 py-2 last:border-b-0">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-0.5 text-[12px]"
                >
                  <span className="line-clamp-2 text-zinc-200 group-hover:text-accent">
                    {c.message}
                  </span>
                  <span className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{c.author}</span>
                    <span className="mono">{c.sha}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon size={12} />
        {label}
      </div>
      <div className="mono mt-1 text-lg font-semibold text-zinc-100">{value}</div>
      {hint && <div className="mt-0.5 text-[10px] text-zinc-500">{hint}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">{title}</div>
      {children}
    </div>
  );
}
