export type NotificationKind = "commit" | "release" | "tag";
export type NotificationSource = "sigmascope" | "sigp";

export type Notification = {
  id: string;
  source: NotificationSource;
  kind: NotificationKind;
  title: string;
  body: string;
  url: string;
  author: string;
  timestamp: string;
  flair?: "feature" | "fix" | "release" | null;
};

export type NotificationFeed = {
  items: Notification[];
  fetchedAt: string;
  sources: { sigmascope: "ok" | "unreachable"; sigp: "ok" | "unreachable" };
};

const GH = "https://api.github.com";

async function safeJson(url: string, timeoutMs = 3500): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "SigmaScope/0.1 (github.com/dwholbar/sigmascope)",
      },
      next: { revalidate: 60 },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function classifyCommitFlair(message: string): Notification["flair"] {
  const m = message.toLowerCase();
  if (m.startsWith("feat") || /\b(add|introduce|implement|launch|ship)\b/.test(m))
    return "feature";
  if (m.startsWith("fix") || /\b(bug|patch|hotfix|resolve)\b/.test(m)) return "fix";
  return null;
}

function mapCommit(raw: any, source: NotificationSource, repo: string): Notification | null {
  const sha = typeof raw?.sha === "string" ? raw.sha : null;
  const fullMessage: string = raw?.commit?.message ?? "";
  const firstLine = fullMessage.split("\n")[0] ?? "";
  const author = raw?.author?.login ?? raw?.commit?.author?.name ?? "unknown";
  const date = raw?.commit?.author?.date ?? raw?.commit?.committer?.date ?? null;
  if (!sha || !firstLine || !date) return null;
  return {
    id: `${source}:commit:${sha}`,
    source,
    kind: "commit",
    title: firstLine,
    body: `${author} pushed to ${repo}`,
    url: raw?.html_url ?? `https://github.com/${repo}/commit/${sha}`,
    author,
    timestamp: date,
    flair: classifyCommitFlair(firstLine),
  };
}

function mapRelease(raw: any, source: NotificationSource, repo: string): Notification | null {
  const tag = raw?.tag_name;
  const date = raw?.published_at ?? raw?.created_at;
  if (!tag || !date) return null;
  return {
    id: `${source}:release:${tag}`,
    source,
    kind: "release",
    title: `${raw?.name ?? tag} released`,
    body: repo,
    url: raw?.html_url ?? `https://github.com/${repo}/releases/tag/${tag}`,
    author: raw?.author?.login ?? "release",
    timestamp: date,
    flair: "release",
  };
}

async function repoCommits(repo: string, source: NotificationSource): Promise<{
  items: Notification[];
  ok: boolean;
}> {
  const raw = await safeJson(`${GH}/repos/${repo}/commits?per_page=15`);
  if (!Array.isArray(raw)) return { items: [], ok: false };
  return {
    items: raw
      .map((c) => mapCommit(c, source, repo))
      .filter((c): c is Notification => c !== null),
    ok: true,
  };
}

async function repoReleases(repo: string, source: NotificationSource): Promise<{
  items: Notification[];
  ok: boolean;
}> {
  const raw = await safeJson(`${GH}/repos/${repo}/releases?per_page=5`);
  if (!Array.isArray(raw)) return { items: [], ok: false };
  return {
    items: raw
      .map((r) => mapRelease(r, source, repo))
      .filter((r): r is Notification => r !== null),
    ok: true,
  };
}

export async function getNotificationFeed(): Promise<NotificationFeed> {
  const [
    scopeCommits,
    scopeReleases,
    sigpCommits,
    sigpReleases,
  ] = await Promise.all([
    repoCommits("dwholbar/sigmascope", "sigmascope"),
    repoReleases("dwholbar/sigmascope", "sigmascope"),
    repoCommits("sigp/lighthouse", "sigp"),
    repoReleases("sigp/lighthouse", "sigp"),
  ]);

  const merged = [
    ...scopeReleases.items,
    ...scopeCommits.items,
    ...sigpReleases.items,
    ...sigpCommits.items,
  ];

  const seen = new Set<string>();
  const dedup: Notification[] = [];
  for (const n of merged) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    dedup.push(n);
  }

  dedup.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return {
    items: dedup.slice(0, 30),
    fetchedAt: new Date().toISOString(),
    sources: {
      sigmascope: scopeCommits.ok ? "ok" : "unreachable",
      sigp: sigpCommits.ok ? "ok" : "unreachable",
    },
  };
}
