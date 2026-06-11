import { Star, GitFork, Package, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { GithubFeed } from "@/lib/github";

export function OrgKpis({ feed }: { feed: GithubFeed }) {
  const totalStars = feed.repos.reduce((acc, r) => acc + r.stars, 0);
  const totalForks = feed.repos.reduce((acc, r) => acc + r.forks, 0);
  const uniqueContribs = feed.lighthouse.contributors.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi icon={Star} label="Total stars" value={totalStars.toLocaleString()} />
        <Kpi icon={GitFork} label="Total forks" value={totalForks.toLocaleString()} />
        <Kpi
          icon={Package}
          label="Public repos"
          value={feed.org.publicRepoCount.toLocaleString()}
        />
        <Kpi
          icon={Users}
          label="Lighthouse contributors"
          value={`${uniqueContribs}+`}
          hint="top 10 shown"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {feed.source === "live" ? (
          <Badge tone="ok">live · github.com/sigp</Badge>
        ) : (
          <Badge tone="muted">snapshot · {feed.snapshotDate}</Badge>
        )}
        <span className="text-zinc-500">
          fetched {new Date(feed.fetchedAt).toLocaleString()}, refreshes hourly
        </span>
      </div>
    </div>
  );
}

function Kpi({
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon size={12} />
        {label}
      </div>
      <div className="mono mt-1 text-xl font-semibold text-zinc-100">{value}</div>
      {hint && <div className="mt-0.5 text-[10px] text-zinc-500">{hint}</div>}
    </div>
  );
}
