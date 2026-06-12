import curated from "./data/vulnerabilities.json";
import categoryAnalyses from "./data/category-analyses.json";

export type CuratedHack = (typeof curated)[number];

export type CategoryAnalysis = {
  engineer: string;
  founder: string;
  sigmaPrime: string;
};

export type LiveHack = {
  id: string;
  name: string;
  year: number;
  date: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  lossUsd: number;
  oneLiner: string;
  source: "live" | "curated";
  link?: string;
  analysis: CategoryAnalysis;
};

const CATEGORY_ANALYSES = categoryAnalyses as Record<string, CategoryAnalysis>;

function analysisFor(category: string): CategoryAnalysis {
  return CATEGORY_ANALYSES[category] ?? CATEGORY_ANALYSES["Other"];
}

export type HackFeed = {
  curated: CuratedHack[];
  live: LiveHack[];
  liveSource: "defillama" | "unavailable";
  fetchedAt: string;
};

const DEFILLAMA_HACKS = "https://api.llama.fi/hacks";

function severityFromAmount(usd: number): LiveHack["severity"] {
  if (usd >= 100_000_000) return "Critical";
  if (usd >= 10_000_000) return "High";
  if (usd >= 1_000_000) return "Medium";
  return "Low";
}

function classifyTechnique(t: unknown): string {
  if (typeof t !== "string") return "Other";
  const s = t.toLowerCase();
  if (s.includes("private key") || s.includes("key compromise") || s.includes("compromised key") || s.includes("multisig") || s.includes("hot wallet") || s.includes("cold wallet"))
    return "Key Compromise";
  if (s.includes("flash")) return "Flash Loan";
  if (s.includes("oracle") || s.includes("price manipulation")) return "Oracle Manipulation";
  if (s.includes("reentr")) return "Reentrancy";
  if (s.includes("bridge") || s.includes("cross-chain") || s.includes("crosschain"))
    return "Bridge";
  if (s.includes("frontend") || s.includes("phishing") || s.includes("supply chain") || s.includes("dns"))
    return "Frontend / Supply Chain";
  if (s.includes("access") || s.includes("authorization") || s.includes("admin") || s.includes("mint") || s.includes("fake lp") || s.includes("lp mint"))
    return "Access Control";
  if (s.includes("governance") || s.includes("voting")) return "Governance";
  if (s.includes("rug") || s.includes("exit scam")) return "Rug Pull";
  if (s.includes("invariant") || s.includes("logic") || s.includes("calculation") || s.includes("rounding"))
    return "Invariant";
  return t;
}

// DefiLlama's amount field is ambiguous: usually millions of USD, occasionally raw USD,
// occasionally garbage. Treat anything >= 100_000 as raw USD (a million-millions would be a
// trillion-dollar hack, which has never happened); treat smaller values as millions.
// Finally, cap at $10B because no single incident in history has crossed that line.
function normaliseAmount(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return 0;
  const usd = raw >= 100_000 ? raw : raw * 1_000_000;
  return Math.min(usd, 10_000_000_000);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function fetchLiveHacks(): Promise<{
  hacks: LiveHack[];
  source: "defillama" | "unavailable";
}> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(DEFILLAMA_HACKS, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "SigmaScope/0.1 (github.com/dwholbar/sigmascope)",
      },
      next: { revalidate: 3600 },
    });
    clearTimeout(t);
    if (!res.ok) return { hacks: [], source: "unavailable" };
    const raw: any[] = await res.json();
    if (!Array.isArray(raw)) return { hacks: [], source: "unavailable" };

    const curatedNames = new Set(
      (curated as CuratedHack[]).map((c) => c.name.toLowerCase()),
    );

    const hacks: LiveHack[] = raw
      .map((row): LiveHack | null => {
        const name = typeof row?.name === "string" ? row.name : null;
        const ts =
          typeof row?.date === "number"
            ? row.date * 1000
            : typeof row?.date === "string"
              ? Date.parse(row.date)
              : NaN;
        const amount = normaliseAmount(row?.amount);
        if (!name || !Number.isFinite(ts)) return null;
        const date = new Date(ts);
        const year = date.getUTCFullYear();
        if (year < 2016) return null;
        if (curatedNames.has(name.toLowerCase())) return null;
        const category = classifyTechnique(row?.technique ?? row?.classification);
        return {
          id: `live-${slugify(name)}-${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`,
          name,
          year,
          date: date.toISOString().slice(0, 10),
          category,
          severity: severityFromAmount(amount),
          lossUsd: Math.round(amount),
          oneLiner:
            typeof row?.technique === "string"
              ? `${row.technique}${typeof row?.chain === "string" && row.chain ? ` on ${row.chain}` : Array.isArray(row?.chain) && row.chain.length ? ` on ${row.chain.join(", ")}` : ""}`
              : "Recorded by DefiLlama; click source link for details.",
          source: "live",
          link: typeof row?.link === "string" ? row.link : undefined,
          analysis: analysisFor(category),
        };
      })
      .filter((h): h is LiveHack => h !== null)
      .sort((a, b) => b.date.localeCompare(a.date));

    return { hacks, source: "defillama" };
  } catch {
    return { hacks: [], source: "unavailable" };
  }
}

export async function getHackFeed(): Promise<HackFeed> {
  const { hacks: live, source } = await fetchLiveHacks();
  return {
    curated: curated as CuratedHack[],
    live,
    liveSource: source,
    fetchedAt: new Date().toISOString(),
  };
}
