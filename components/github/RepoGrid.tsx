"use client";

import { useMemo, useState } from "react";
import { Star, GitFork, AlertCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import type { RepoSummary } from "@/lib/github";

type Sort = "stars" | "pushed" | "alpha";

function daysAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "1 day ago";
  if (d < 30) return `${d} days ago`;
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  return `${Math.floor(d / 365)} years ago`;
}

export function RepoGrid({ repos }: { repos: RepoSummary[] }) {
  const [sort, setSort] = useState<Sort>("stars");
  const [lang, setLang] = useState<string | null>(null);

  const languages = useMemo(() => {
    const set = new Set<string>();
    for (const r of repos) if (r.language) set.add(r.language);
    return Array.from(set).sort();
  }, [repos]);

  const filtered = useMemo(() => {
    let out = repos;
    if (lang) out = out.filter((r) => r.language === lang);
    if (sort === "stars") out = [...out].sort((a, b) => b.stars - a.stars);
    else if (sort === "pushed")
      out = [...out].sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
    else out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [repos, sort, lang]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Dropdown
          label="Sort by"
          value={sort}
          onChange={(v) => setSort((v as Sort) ?? "stars")}
          options={[
            { value: "stars", label: "Most stars" },
            { value: "pushed", label: "Recently pushed" },
            { value: "alpha", label: "Alphabetical" },
          ]}
          placeholder="Most stars"
        />
        <Dropdown
          label="Language"
          value={lang}
          onChange={setLang}
          options={languages.map((l) => ({ value: l, label: l }))}
          placeholder="All languages"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="card card-hover group flex flex-col gap-2 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-zinc-100 group-hover:text-accent">
                  {r.name}
                </span>
                <ExternalLink size={12} className="text-zinc-600 group-hover:text-accent" />
              </div>
              {r.language && <Badge tone="muted">{r.language}</Badge>}
            </div>
            <p className="line-clamp-2 min-h-[2.5em] text-[12px] leading-relaxed text-zinc-400">
              {r.description ?? "No description"}
            </p>
            <div className="mt-1 flex items-center gap-4 text-[11px] text-zinc-500">
              <span className="mono flex items-center gap-1">
                <Star size={11} />
                {r.stars.toLocaleString()}
              </span>
              <span className="mono flex items-center gap-1">
                <GitFork size={11} />
                {r.forks.toLocaleString()}
              </span>
              <span className="mono flex items-center gap-1">
                <AlertCircle size={11} />
                {r.openIssues}
              </span>
              <span className="ml-auto text-[10px]">{daysAgo(r.pushedAt)}</span>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="card col-span-full grid place-items-center p-10 text-center text-sm text-zinc-500">
            No repos match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
