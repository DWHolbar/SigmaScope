import snapshot from "./data/github-snapshot.json";

export type RepoSummary = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  url: string;
};

export type LighthouseRelease = {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
};

export type LighthouseContributor = {
  login: string;
  contributions: number;
  avatarUrl: string;
  url: string;
};

export type LighthouseCommit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

export type LighthouseSpotlight = {
  stars: number;
  forks: number;
  openIssues: number;
  subscribers: number;
  defaultBranch: string;
  pushedAt: string;
  description: string;
  url: string;
  releases: LighthouseRelease[];
  contributors: LighthouseContributor[];
  recentCommits: LighthouseCommit[];
};

export type GithubFeed = {
  source: "live" | "snapshot";
  fetchedAt: string;
  snapshotDate?: string;
  org: { login: string; name: string; description: string; blog: string; publicRepoCount: number };
  repos: RepoSummary[];
  lighthouse: LighthouseSpotlight;
};

const GH = "https://api.github.com";

async function safeJson(url: string, timeoutMs = 4000): Promise<any | null> {
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
      next: { revalidate: 3600 },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function fromSnapshot(): GithubFeed {
  return {
    source: "snapshot",
    fetchedAt: new Date().toISOString(),
    snapshotDate: snapshot.snapshotDate,
    org: snapshot.org,
    repos: snapshot.repos as RepoSummary[],
    lighthouse: snapshot.lighthouse as LighthouseSpotlight,
  };
}

function mapRepo(raw: any): RepoSummary {
  return {
    name: raw.name,
    description: raw.description ?? null,
    language: raw.language ?? null,
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    openIssues: raw.open_issues_count ?? 0,
    pushedAt: raw.pushed_at ?? new Date().toISOString(),
    url: raw.html_url ?? `https://github.com/sigp/${raw.name}`,
  };
}

export async function getGithubFeed(): Promise<GithubFeed> {
  const [orgRaw, reposRaw, lhRaw, releasesRaw, contribsRaw, commitsRaw] = await Promise.all([
    safeJson(`${GH}/orgs/sigp`),
    safeJson(`${GH}/orgs/sigp/repos?per_page=100&sort=pushed&type=public`),
    safeJson(`${GH}/repos/sigp/lighthouse`),
    safeJson(`${GH}/repos/sigp/lighthouse/releases?per_page=5`),
    safeJson(`${GH}/repos/sigp/lighthouse/contributors?per_page=10`),
    safeJson(`${GH}/repos/sigp/lighthouse/commits?per_page=10`),
  ]);

  if (!orgRaw || !Array.isArray(reposRaw) || !lhRaw) {
    return fromSnapshot();
  }

  const repos = (reposRaw as any[])
    .filter((r) => !r.fork && !r.archived)
    .map(mapRepo)
    .sort((a, b) => b.stars - a.stars);

  const releases: LighthouseRelease[] = Array.isArray(releasesRaw)
    ? releasesRaw.map((r: any) => ({
        tag: r.tag_name,
        name: r.name ?? r.tag_name,
        publishedAt: r.published_at,
        url: r.html_url,
      }))
    : snapshot.lighthouse.releases;

  const contributors: LighthouseContributor[] = Array.isArray(contribsRaw)
    ? contribsRaw.map((c: any) => ({
        login: c.login,
        contributions: c.contributions,
        avatarUrl: c.avatar_url,
        url: c.html_url,
      }))
    : snapshot.lighthouse.contributors;

  const recentCommits: LighthouseCommit[] = Array.isArray(commitsRaw)
    ? commitsRaw.map((c: any) => ({
        sha: c.sha?.slice(0, 7) ?? "",
        message: (c.commit?.message ?? "").split("\n")[0],
        author: c.author?.login ?? c.commit?.author?.name ?? "unknown",
        date: c.commit?.author?.date ?? "",
        url: c.html_url ?? "",
      }))
    : snapshot.lighthouse.recentCommits;

  return {
    source: "live",
    fetchedAt: new Date().toISOString(),
    org: {
      login: orgRaw.login,
      name: orgRaw.name ?? "Sigma Prime",
      description: orgRaw.description ?? snapshot.org.description,
      blog: orgRaw.blog ?? snapshot.org.blog,
      publicRepoCount: orgRaw.public_repos ?? repos.length,
    },
    repos,
    lighthouse: {
      stars: lhRaw.stargazers_count ?? 0,
      forks: lhRaw.forks_count ?? 0,
      openIssues: lhRaw.open_issues_count ?? 0,
      subscribers: lhRaw.subscribers_count ?? 0,
      defaultBranch: lhRaw.default_branch ?? "unstable",
      pushedAt: lhRaw.pushed_at ?? new Date().toISOString(),
      description: lhRaw.description ?? snapshot.lighthouse.description,
      url: lhRaw.html_url ?? snapshot.lighthouse.url,
      releases,
      contributors,
      recentCommits,
    },
  };
}
