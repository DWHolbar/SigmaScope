# SigmaScope

A Next.js 14 portfolio site built as a Technical Account Manager (TAM) demo for Sigma Prime.
Six tabs: Pulse, Blueprint, Scoping, Intel, GitHub, Studio. Deployed on Vercel.

---

## What this project is

SigmaScope simulates the things a Sigma Prime TAM actually does day-to-day:

- **Pulse** (`/`) - live Ethereum consensus stats (slot, epoch, participation, client diversity).
- **Blueprint** (`/blueprint`) - meta page explaining how the site works.
- **Scoping** (`/scoping`) - interactive audit-scoping form with PDF export.
- **Intel** (`/intel`) - 29 hand-curated historical exploits + live DefiLlama overlay.
- **GitHub** (`/github`) - live dashboard of `github.com/sigp` with a Lighthouse spotlight.
- **Studio** (`/studio`) - 8 deterministic content-template builders.

It is a portfolio piece, not affiliated with Sigma Prime.

---

## Stack

- **Next.js 14** App Router, TypeScript, server components by default, client components only
  where state or interactivity demands it.
- **Tailwind v3** dark-mode default. No UI library; hand-built primitives in `components/ui/`.
- **No charting library.** Donut and sparkline are hand-built SVG. Recharts was dropped in v1
  because of SSR hydration bugs - do not bring it back.
- **jsPDF** for client-side PDF generation (proposals + content drafts).
- **Lucide React** for icons. Import the `LucideIcon` type when using icons in typed records.

---

## Repository conventions (important)

1. **No em dashes or en dashes anywhere.** Use spaced hyphens or "to" for ranges. The linter
   has run; new content must follow suit. Check with:
   `grep -rn $'\xe2\x80\x93\|\xe2\x80\x94' --include='*.{ts,tsx,json,md}' .`

2. **Honesty disclaimers are part of the product.** Anywhere a number is heuristic or
   estimated, the UI says so. The disclaimer copy on the Scoping output panel and the Blueprint
   "Honest limits" section are reference templates - match that voice.

3. **Reuse existing primitives.** Before adding new components, check `components/ui/` (Card,
   CardHeader, Badge, Button, Dropdown) and `components/PageHeader.tsx`. Do not duplicate the
   page-header pattern.

4. **API routes follow one shape.** Server-side `safeJson` with AbortController + 3-4s timeout,
   typed response, snapshot fallback when upstream is unreachable, `revalidate` set explicitly,
   `Cache-Control: s-maxage=N, stale-while-revalidate=...` header. See `app/api/beacon/route.ts`
   and `lib/beacon.ts` as the canonical pair.

5. **JSON data files use direct typed imports.** `(typeof imported)[number]` style narrowing,
   no helper wrappers. See `lib/hacks.ts:3` for the pattern.

6. **Theme colours.** Background `zinc-950`, surface `zinc-900/40`, border `zinc-800`, accent
   `cyan-400` (`#22d3ee`). Custom CSS variables live in `app/globals.css:5-13`. Reuse the
   `.mono`, `.card`, `.card-hover`, `.glow-accent` classes from there.

---

## File layout

```
app/
  page.tsx                  # Network Pulse (Tab 1)
  blueprint/page.tsx        # Blueprint (Tab 2)
  scoping/page.tsx          # Audit Scoping (Tab 3)
  intel/page.tsx            # Vulnerability Intel (Tab 4)
  github/page.tsx           # GitHub Intelligence (Tab 5)
  studio/page.tsx           # Content Studio (Tab 6)
  api/
    beacon/route.ts         # beaconcha.in proxy + genesis math
    hacks/route.ts          # DefiLlama proxy
    github/route.ts         # github.com/sigp aggregator
    notifications/route.ts  # repo activity feed for the notification bell

components/
  Nav.tsx                   # Top bar, six tabs, icons-only on mobile
  PageHeader.tsx            # Shared page header (badge + h1 + paragraph + callout)
  NotificationBell.tsx      # Top-right bell with dropdown
  ui/                       # Card, Badge, Button, Dropdown
  network/                  # ClientDiversityChart, ParticipationGauge, LiveSlotTicker, ...
  scoping/                  # ScopingForm
  intel/                    # VulnerabilityExplorer
  github/                   # OrgKpis, RepoGrid, LighthouseSpotlight
  studio/                   # StudioForm

lib/
  beacon.ts                 # Genesis-derived slot/epoch + beaconcha.in enrichment
  hacks.ts                  # DefiLlama normaliser
  github.ts                 # GitHub REST aggregator + snapshot fallback
  notifications.ts          # Notification feed aggregator
  proposal.ts               # Audit-scoping heuristic (LOC + modifiers + cost band)
  threat-models.ts          # Per-protocol-type threat templates
  pdf.ts                    # jsPDF helpers: generateProposalPdf, generateContentPdf
  studio/
    topics.ts               # 15 curated topics
    templates.ts            # 8 deterministic template builders
  data/                     # JSON fixtures and offline snapshots
```

---

## Data sources (and which are live)

| Source | URL | Used by | Liveness |
|---|---|---|---|
| beaconcha.in | `https://beaconcha.in/api/v1/epoch/{n}` | `lib/beacon.ts` | Live; falls back to estimate |
| Beacon genesis math | none (deterministic) | `lib/beacon.ts:deriveSlotEpoch` | Always live |
| DefiLlama hacks | `https://api.llama.fi/hacks` | `lib/hacks.ts` | Live; falls back to curated only |
| GitHub REST | `https://api.github.com/orgs/sigp/...` | `lib/github.ts` | Live; falls back to snapshot |
| GitHub REST (this repo) | `https://api.github.com/repos/dwholbar/sigmascope/...` | `lib/notifications.ts` | Live; bell shows empty if unreachable |
| Hand-curated JSON | `lib/data/*.json` | various | Curated, never live |

Anonymous GitHub API gets 60 req/hr per IP. With `revalidate = 3600` on the route handlers and
Vercel's edge cache, this is fine. The notification route uses `revalidate = 60` because the
whole point is freshness, so it's the most rate-limit-sensitive endpoint.

---

## Common tasks

### Add a new historical exploit to the Intel archive

1. Edit `lib/data/vulnerabilities.json` and append a new object with the existing schema:
   `id, name, year, date, category, severity, lossUsd, oneLiner, engineerExplain,
   founderImpact, sigmaPrimeMitigation`.
2. No code changes needed - the page auto-picks up new entries.

### Add a new Sigma Prime topic to the Content Studio

1. Append a `Topic` object to the array in `lib/studio/topics.ts` with `id, kind, name, short,
   facets`. `standout`, `numbers`, `risk`, `cta` are all optional.
2. No template changes needed - templates auto-degrade for optional fields.

### Add a new content template

1. Add a new `Template` const in `lib/studio/templates.ts` with `id, name, kind, description,
   render`. The `render` function receives `{topic, audience, tone, length}` and returns a
   string.
2. Append it to the `TEMPLATES` array at the bottom of the file.
3. Add an icon mapping in `components/studio/StudioForm.tsx:TEMPLATE_ICONS`.

### Add a new tab

1. Add the route under `app/<slug>/page.tsx`, using `<PageHeader>` for the header.
2. Add an entry to the `links` array in `components/Nav.tsx`.
3. Add a row to the architecture-map table in `app/blueprint/page.tsx:rows`.
4. If the tab needs live data, mirror the `app/api/beacon/route.ts` + `lib/beacon.ts` pattern.

### Update offline snapshots

The GitHub snapshot (`lib/data/github-snapshot.json`) and beacon mock
(`lib/data/beacon-mock.json`) are used when upstream APIs are unreachable. They should be
refreshed every few months; their dates are tagged in each file.

---

## Build, test, deploy

```bash
npm install
npm run dev        # localhost:3000
npm run build      # production build, all routes prerendered
npm start          # serve the build, useful for smoke tests on a clean port
```

Deploy on Vercel by importing the repo. No environment variables required for the current
feature set. If a future feature uses an authenticated GitHub token, set `GITHUB_TOKEN` in
Vercel env and read it in `lib/github.ts:safeJson` headers.

The branch in active use is `claude/dazzling-albattani-TfcrV`. Push there.

---

## Pitfalls to avoid

- **Recharts.** It has SSR hydration bugs in Next.js 14. Use hand-built SVG (see
  `components/network/ClientDiversityChart.tsx` and `ParticipationGauge.tsx`).
- **lucide-react icon typing.** Always import `type LucideIcon` when using icons in a typed
  `Record`. `React.ComponentType<{size?: number}>` does not work for forwardRef'd icons.
- **JSX inside JSON imports.** JSON files are imported directly; do not embed JSX strings in
  them. Render-time formatting belongs in the component, not the data.
- **Server components calling client-only APIs.** `lib/pdf.ts` uses jsPDF which is client-only;
  it can only be called from `"use client"` components. Same for `navigator.clipboard`.
- **GitHub rate limits.** Notification route is the spiciest endpoint. Cap polls to ~60s on
  the client and respect the route's `revalidate` cache. If we add `GITHUB_TOKEN` later, the
  budget jumps from 60 to 5000 req/hr.
